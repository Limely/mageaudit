/**
 * GET /api/scan?url=<store>
 *
 * Streams the scan as newline-delimited JSON (NDJSON): one `ScanMessage` per
 * line, flushed as each check settles. Consume it with a fetch + ReadableStream
 * reader on the client, or `curl -N` from the terminal.
 *
 * Example:
 *   curl -N "http://localhost:3000/api/scan?url=race-shop.nl"
 */

import type { NextRequest } from "next/server";
import { bareDomain } from "@/lib/domain";
import { runScan } from "@/lib/scanner/run";
import { saveReport, type StoredReport } from "@/lib/scanner/store";
import type { Check, Enrichment, ScanMessage } from "@/lib/scanner/types";

// Never cache; run on the Node runtime (raw fetch + streaming).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Accumulate the scan so we can persist the finished report as a side
      // effect (powers the /scan/<domain> stored view). Runs server-side even
      // if the client disconnects mid-stream.
      let meta: Extract<ScanMessage, { type: "meta" }> | undefined;
      let enrichment: Enrichment | undefined;
      let summary: Extract<ScanMessage, { type: "done" }>["summary"] | undefined;
      const checks: Check[] = [];

      const emit = (msg: ScanMessage) => {
        if (msg.type === "meta") meta = msg;
        else if (msg.type === "result") checks.push(msg.data);
        else if (msg.type === "enrichment") enrichment = msg.data;
        else if (msg.type === "done") summary = msg.summary;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));
        } catch {
          /* client disconnected — keep going so the report still persists */
        }
      };

      try {
        await runScan(url ?? "", emit);
      } catch (e) {
        emit({ type: "error", message: e instanceof Error ? e.message : "Scan failed", code: "internal" });
      } finally {
        controller.close();
      }

      if (meta && summary && url) {
        const report: StoredReport = {
          domain: bareDomain(url),
          scannedAt: new Date().toISOString(),
          meta: { canonicalUrl: meta.canonicalUrl, platform: meta.platform, edition: meta.edition, versionString: meta.versionString },
          checks,
          enrichment,
          summary,
        };
        try {
          await saveReport(report);
        } catch {
          /* persistence is best-effort; never fail the response over it */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no", // don't let a reverse proxy buffer the stream
    },
  });
}
