/**
 * Report store. Persists the last completed scan per domain so a per-store URL
 * (/scan/<domain>) can render instantly without re-scanning, with a re-scan
 * button to refresh.
 *
 * Backed by flat JSON files for now (one per domain) — consistent with the
 * version DB, no external infra. The interface (get/save/list) is what a real
 * KV/Postgres store would expose, so swapping later is a one-file change.
 *
 * Note: the default location is a `.data/` dir under cwd, which persists in
 * `next dev` and Node-server deploys but NOT on ephemeral serverless
 * filesystems — point SCAN_DATA_DIR at durable storage, or swap this module
 * for a KV client, before deploying to Vercel. See scan.md.
 */

import { promises as fs } from "fs";
import path from "path";
import { bareDomain } from "@/lib/domain";
import type { Check, Enrichment, Platform, RiskRating } from "./types";

export interface StoredReport {
  domain: string;
  scannedAt: string; // ISO timestamp
  meta: { canonicalUrl: string; platform: Platform; edition?: string; versionString?: string };
  checks: Check[];
  enrichment?: Enrichment;
  summary: { total: number; high: number; medium: number; ok: number; overall: RiskRating };
}

const DIR = process.env.SCAN_DATA_DIR || path.join(process.cwd(), ".data", "reports");

function fileFor(domain: string): string {
  // encodeURIComponent keeps the filename safe (no slashes/colons).
  return path.join(DIR, encodeURIComponent(bareDomain(domain)) + ".json");
}

export async function saveReport(report: StoredReport): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(report.domain), JSON.stringify(report, null, 2), "utf8");
}

export async function getReport(domain: string): Promise<StoredReport | null> {
  try {
    return JSON.parse(await fs.readFile(fileFor(domain), "utf8")) as StoredReport;
  } catch {
    return null; // not scanned yet, or unreadable
  }
}

export async function listReports(): Promise<StoredReport[]> {
  try {
    const files = await fs.readdir(DIR);
    const reports = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          try {
            return JSON.parse(await fs.readFile(path.join(DIR, f), "utf8")) as StoredReport;
          } catch {
            return null;
          }
        }),
    );
    return reports.filter((r): r is StoredReport => r !== null).sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
  } catch {
    return [];
  }
}
