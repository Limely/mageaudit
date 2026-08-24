# Scan engine

How MageAudit scans a store. This documents the `/api/scan` endpoint, the
message protocol, and the check catalogue. Keep it updated as checks are added.

## Endpoint

```
GET /api/scan?url=<store>
```

- `url` — the store to scan. Scheme and `www.` optional (`race-shop.nl`,
  `https://www.example.com/` both work).
- Responds with **newline-delimited JSON** (`application/x-ndjson`): one
  message per line, flushed as each check settles — so results stream in
  out of order, fastest-first, the way MageReport's WebSocket does.
- Runs on the Node runtime, never cached.

Test from the terminal (dev server picks the first free port — often 3001 if
another instance is already running):

```bash
curl -N "http://localhost:3000/api/scan?url=race-shop.nl"
```

Consume in the browser with a `fetch` + `ReadableStream` reader, splitting on
`\n` and `JSON.parse`-ing each line. (This is the integration point flagged in
`components/ScanForm.tsx`.)

### Why NDJSON over HTTP, not a WebSocket

MageReport streams over `wss://…/scan/result/`. We use a streaming HTTP
response instead because it deploys cleanly on serverless (Vercel) with no
socket server, is trivial to `curl`, and the scan is short-lived and
one-directional (server → client) so we don't need duplex.

## Message protocol

Every line is a `ScanMessage` (see `lib/scanner/types.ts`):

| `type`        | Shape | When |
|---------------|-------|------|
| `meta`        | `{ canonicalUrl, platform, edition?, versionString? }` | once, after fingerprinting succeeds |
| `result`      | `{ data: Check }` | once per check, as it completes |
| `enrichment`  | `{ data: Enrichment }` | once, when the Limely lookup returns |
| `done`        | `{ summary: { total, high, medium, ok, overall } }` | last message on success |
| `error`       | `{ message, code }` | terminal; no `done` follows |

`Check`: `{ check, title, result: ok|fail|unknown, riskRating: low|medium|high|unknown, resultString, indicators? }`.

Error `code`s: `bad_url`, `unreachable`, `not_magento`, `blocked`, `internal`.

## Architecture

```
app/
  api/scan/route.ts       HTTP + NDJSON streaming (the transport); persists on completion
  scan/[domain]/page.tsx  per-store report page (server component, noindex)
components/
  ScanForm.tsx            homepage form → navigates to /scan/<domain>
  StoreReport.tsx         renders stored report or runs a live scan + re-scan
  ScanResults.tsx         presentational (design agent) — reused for both
lib/
  useScan.ts              client hook: consumes the NDJSON stream
  domain.ts               client-safe bareDomain() helper
  scanner/
    run.ts                orchestrator: normalise → detect → fan out → summary
    detect.ts             Magento fingerprint (M1/M2, edition, version)
    checks.ts             the security checks (registry of CheckDef)
    version-db.ts         version → verdict, reads data/magento-versions.json
    fetch.ts              fetch layer: direct + ScrapingBee WAF fallback
    limely.ts             Limely store-intelligence enrichment
    store.ts              flat-file report store (get/save/list)
    types.ts              shared types
```

Flow: `runScan()` normalises the URL, fingerprints the store once (homepage +
`/magento_version`), then fires **all checks and the Limely lookup
concurrently**, emitting each as it resolves. Every check is wrapped in a
20s timeout and a catch, so one slow/broken probe can't stall or fail the scan.

### Fetch layer (the Cloudflare problem)

External scanning is defeated by WAFs — MageReport reports "No Magento found"
on Cloudflare-fronted stores. `fetchTarget()` handles this in two tiers:

1. **Direct** browser-UA fetch (free, fast) — works for most stores.
2. **ScrapingBee fallback** — only when the direct response looks blocked
   (403/429/503 or a challenge page) *and* `SCRAPINGBEE_API_KEY` is set. Uses
   `premium_proxy=true`, `render_js=false`, `transparent_status_code=true`
   (10 credits/req — the right mode for raw status/header probes; stealth's
   forced JS render would mask the exact status codes checks rely on).

Note: our HTML-marker fallback in `detect.ts` already fingerprints some
Cloudflare stores that MageReport misses (it only trusts `/magento_version`).
Confirmed on factory-direct-flooring.co.uk.

### Enrichment (Limely API)

`enrich()` reads the **fast cached** Limely endpoint
(`/api/magento/site/get/{domain}`) for theme/vendor/Hyvä/edition/modules and
company details. We deliberately do **not** trigger the live scrape (`POST
/api/magento/url`) during a scan — it takes ~2 min. Limely is a
profiler, not a security source: it carries no version/patch/malware data, so
it complements the probes rather than replacing them.

## Check catalogue

Implemented in `lib/scanner/checks.ts` (all read-only GET probes):

| Check | What it does |
|-------|--------------|
| `security.magversion`      | Version/edition from `/magento_version`, scored against the version DB (EOL, patch level, known CVEs) |
| `security.sslcheck`        | Valid HTTPS + HTTP→HTTPS redirect |
| `security.securityheaders` | HSTS / CSP / X-Content-Type-Options / X-Frame-Options |
| `security.openversioncontrol` | `/.git/config` publicly readable |
| `security.opendev`         | `.env`, `app/etc/env.php`, `app/etc/local.xml` leaks |
| `security.opendownloader`  | `/downloader/` reachable (Magento 1) |
| `security.openmagmi`       | Magmi importer publicly reachable |
| `security.opensetup`       | Magento 2 Setup Wizard (`/setup/`) publicly reachable |
| `security.exposedapi`      | Unauthenticated `/rest/V1/products` returns data |
| `security.composer`        | `composer.json` public (leaks package versions) |
| `security.phpinfo`         | `phpinfo.php` / `info.php` exposed |

## Per-store report pages

Every store gets its own URL: **`/scan/<domain>`** (e.g. `/scan/example.com`).
The homepage form navigates there instead of scanning inline.

- **Stored, not ephemeral.** A completed scan is persisted by the `/api/scan`
  route as a side effect (see `store.ts`), so the page renders the saved report
  instantly server-side, with a "last scanned …" timestamp and a **Re-scan**
  button. First visit to an un-scanned domain auto-runs a live scan.
- **Private / unlisted.** These pages set `robots: noindex, nofollow` — they're
  reachable by URL but never indexed, so we don't publish third-party stores'
  security findings to search engines. (This was a deliberate call; flipping to
  public/indexed would be an SEO play but is disclosure-sensitive.)
- **Storage.** Flat JSON files, one per domain, under `.data/reports/`
  (gitignored). Same philosophy as the version DB — no infra yet. `store.ts`'s
  get/save/list interface is what a KV/Postgres backend would expose.
  **Serverless caveat:** the default `.data/` dir is ephemeral on Vercel/Lambda
  — set `SCAN_DATA_DIR` to durable storage or swap `store.ts` for a KV client
  before deploying.

## Version intelligence

`security.magversion` scores the detected version against a hand-maintained
flat file, `lib/scanner/data/magento-versions.json`, via `version-db.ts`. No
database yet — the JSON is the single source of truth and a future DB would
expose the same `assessVersion()` shape.

The file holds three things: `eolBranches` (whole branches past end-of-life,
keyed by the `major.minor` string `/magento_version` reports), `minorLines`
(per-2.4.x status + latest patch, used when an exact version is known), and
`vulnerabilities` (notable CVEs/SUPEE patches with their fix versions).

**Precision caveat.** Magento's `/magento_version` only discloses the branch
(e.g. `2.4`), never the patch level. So the common live verdict is branch-level:

- EOL branch (`1.x`, `2.0`–`2.3`) → **high**, "end-of-life, no security updates since …".
- Supported branch, patch unknown (`2.4`) → **medium** advisory, listing CVEs
  that apply *if unpatched* (CosmicSting, TrojanOrder) — not asserted as confirmed.
- Exact version known (from a future fingerprint, or if it leaks) → precise
  verdict: EOL line → high, confirmed critical CVE → high, behind latest
  patch → medium, current → **ok/low**.

**Maintenance.** This is seed data flagged as non-authoritative. When Adobe
ships a security bulletin, add the CVE to `vulnerabilities` (with per-line
`fixedIn`) and bump `minorLines[*].latestPatch` and `meta.latestPatch`. Update
`meta.updated`. That's the whole workflow — one JSON file, no code change.

## Verified against real stores

| Store | Result |
|-------|--------|
| `race-shop.nl` | M2 Community 2.4; 10 checks streamed; flagged missing HSTS/CSP → overall `medium`. |
| `hartsofstur.com` | M2 Enterprise; Limely enrichment hit (`vendor=Gene`). |
| `factory-direct-flooring.co.uk` | Behind Cloudflare — MageReport reports "No Magento found" here, but our HTML-marker fallback correctly detects M2 and Limely returns full data (Hyvä, modules, company). We beat MageReport on this store. |
| `example.com` | Clean `not_magento` error. |
| empty / `abc` | `bad_url` error. |

Enrichment misses on non-UK stores (e.g. `.nl`) are expected — Limely's DB is UK-focused.

## TODO / roadmap

Ordered by leverage:

1. ~~**Version → EOL/patch DB.**~~ ✅ Done — see [Version intelligence](#version-intelligence).
   `magversion` now scores against `magento-versions.json`. Ongoing work is
   keeping that file current with Adobe bulletins.
2. **Exact version fingerprinting** via static-asset hashes for stores that
   only disclose the branch via `/magento_version`. This unlocks the precise
   CVE matching already implemented in `version-db.ts` (currently only fires
   when an exact version is known).
3. **Extension-vuln checks gated by `enrichment.modules`.** The Limely
   `modules` list tells us which extensions are installed → only run the
   relevant extension-RCE probes (Ajaxproducts, Cart2Quote, etc.).
4. **Malware/skimmer signatures** (Visbot, GuruInc, cryptojacking, card
   hijack) — scan homepage/checkout JS for known-bad patterns.
5. Set `SCRAPINGBEE_API_KEY` in production to unlock WAF'd stores.

## Config

`.env.local` (gitignored):

```
LIMELY_API_BASE=https://api.limely.co.uk
LIMELY_API_KEY=…            # do not commit
SCRAPINGBEE_API_KEY=        # blank = direct fetch only
```
