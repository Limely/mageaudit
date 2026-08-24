"use client";

import { useCallback, useRef, useState } from "react";
import type { Check, Enrichment, ScanMessage, RiskRating } from "@/lib/scanner/types";

export interface ScanState {
  status: "idle" | "scanning" | "done" | "error";
  meta?: Extract<ScanMessage, { type: "meta" }>;
  checks: Check[];
  enrichment?: Enrichment;
  summary?: { total: number; high: number; medium: number; ok: number; overall: RiskRating };
  error?: string;
}

const initial: ScanState = { status: "idle", checks: [] };

/**
 * Consumes the NDJSON stream from GET /api/scan and exposes incremental state.
 * Splits the byte stream on newlines and JSON.parses each ScanMessage as it
 * arrives, so checks render fastest-first while the scan is still running.
 */
export function useScan() {
  const [state, setState] = useState<ScanState>(initial);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(initial);
  }, []);

  const scan = useCallback(async (url: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: "scanning", checks: [] });

    const apply = (msg: ScanMessage) => {
      setState((prev) => {
        switch (msg.type) {
          case "meta":
            return { ...prev, meta: msg };
          case "result":
            return { ...prev, checks: [...prev.checks, msg.data] };
          case "enrichment":
            return { ...prev, enrichment: msg.data };
          case "done":
            return { ...prev, status: "done", summary: msg.summary };
          case "error":
            return { ...prev, status: "error", error: msg.message };
          default:
            return prev;
        }
      });
    };

    try {
      const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`, {
        signal: controller.signal,
        headers: { Accept: "application/x-ndjson" },
      });
      if (!res.ok || !res.body) {
        throw new Error(`Scan request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            apply(JSON.parse(line) as ScanMessage);
          } catch {
            /* ignore a partial/garbled line */
          }
        }
      }
      // Flush any trailing line without a newline.
      const tail = buffer.trim();
      if (tail) {
        try {
          apply(JSON.parse(tail) as ScanMessage);
        } catch {
          /* ignore */
        }
      }

      // Stream closed without an explicit done/error message.
      setState((prev) =>
        prev.status === "scanning" ? { ...prev, status: "done" } : prev
      );
    } catch (e) {
      if (controller.signal.aborted) return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: e instanceof Error ? e.message : "Scan failed",
      }));
    }
  }, []);

  return { state, scan, reset };
}
