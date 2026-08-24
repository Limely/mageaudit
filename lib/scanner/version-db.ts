/**
 * Version intelligence. Turns a detected Magento version into a security
 * verdict — end-of-life status, how far behind the latest patch it is, and
 * which known vulnerabilities apply — by looking it up in the flat file
 * `data/magento-versions.json`.
 *
 * Reality check on precision: Magento's `/magento_version` only discloses the
 * branch (e.g. "2.4"), never the patch level. So most live detections are
 * branch-only, and we deliberately DON'T assert patch-level CVEs against them
 * (that would be a guess). We report EOL/branch status and flag notable CVEs
 * as "possible if unpatched". Precise CVE matching kicks in automatically once
 * an exact version is known (e.g. from asset-hash fingerprinting — see scan.md).
 */

import db from "./data/magento-versions.json";
import type { CheckResult, Platform, RiskRating } from "./types";

interface ParsedVersion {
  segments: number[]; // e.g. [2,4,6] or [1,9,4,5]
  patch: number; // the -pN suffix, 0 if absent
  /** How specific the input was. */
  precision: "branch" | "minor" | "patch";
  raw: string;
}

/** Parse "2.4", "2.4.6", "2.4.6-p3", "1.9.4.5" into a comparable shape. */
export function parseVersion(raw: string): ParsedVersion | null {
  const m = raw.trim().match(/^(\d+(?:\.\d+)*)(?:-p(\d+))?$/i);
  if (!m) return null;
  const segments = m[1].split(".").map(Number);
  const patch = m[2] ? Number(m[2]) : 0;
  const precision = segments.length <= 2 ? "branch" : m[2] ? "patch" : "minor";
  return { segments, patch, precision, raw };
}

/** Compare two parsed versions: -1 if a<b, 0 if equal, 1 if a>b. */
function compare(a: ParsedVersion, b: ParsedVersion): number {
  const len = Math.max(a.segments.length, b.segments.length);
  for (let i = 0; i < len; i++) {
    const d = (a.segments[i] ?? 0) - (b.segments[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return 0;
}

/** major.minor key, e.g. "2.4" — how /magento_version and eolBranches are keyed. */
function branchKey(v: ParsedVersion): string {
  if (v.segments[0] === 1) return "1";
  return v.segments.slice(0, 2).join(".");
}

/** minor-line key, e.g. "2.4.6". */
function minorKey(v: ParsedVersion): string {
  return v.segments.slice(0, 3).join(".");
}

interface Vuln {
  id: string;
  alias: string | null;
  severity: string;
  title: string;
  platforms: string[];
  fixedIn?: string[];
  m1FixedAtOrAbove?: string;
  kb: string;
}

/** Is `v` affected by a vuln, given the fix versions? Only meaningful for precise versions. */
function isAffected(v: ParsedVersion, vuln: Vuln, platform: Platform): boolean {
  if (!vuln.platforms.includes(platform)) return false;

  if (platform === "magento1" && vuln.m1FixedAtOrAbove) {
    const fix = parseVersion(vuln.m1FixedAtOrAbove);
    return fix ? compare(v, fix) < 0 : false;
  }

  if (vuln.fixedIn?.length) {
    // Find the fix that belongs to this version's own minor line.
    const line = minorKey(v);
    const lineFix = vuln.fixedIn.map(parseVersion).find((f) => f && minorKey(f) === line);
    if (lineFix) return compare(v, lineFix) < 0;
    // No fix listed for this line: if the whole line predates the earliest
    // fixed line, it's affected; otherwise unknown -> treat as not-confirmed.
    const earliest = vuln.fixedIn.map(parseVersion).filter(Boolean).sort((a, b) => compare(a!, b!))[0];
    return earliest ? compare(v, earliest) < 0 : false;
  }
  return false;
}

export interface VersionVerdict {
  result: CheckResult;
  riskRating: RiskRating;
  resultString: string;
  indicators: string;
}

const data = db as unknown as {
  meta: { updated: string; latestPatch: { magento2: string } };
  eolBranches: Record<string, { label: string; eol: string }>;
  minorLines: Record<string, { status: string; latestPatch: string }>;
  vulnerabilities: Vuln[];
};

export function assessVersion(platform: Platform, versionString?: string, edition?: string): VersionVerdict {
  const label = (edition ? edition + " " : "") + (versionString ?? "");
  const latest = data.meta.latestPatch.magento2;

  if (!versionString) {
    return {
      result: "unknown",
      riskRating: "unknown",
      resultString: "version not disclosed",
      indicators: `latest is ${latest} (db ${data.meta.updated})`,
    };
  }

  const v = parseVersion(versionString);
  if (!v) {
    return { result: "unknown", riskRating: "unknown", resultString: `unrecognised version "${versionString}"`, indicators: "" };
  }

  const branch = branchKey(v);
  const vulnName = (x: Vuln) => x.alias ?? x.id;

  // 1. End-of-life branch => high, no patch level needed.
  const eol = data.eolBranches[branch];
  if (eol || platform === "magento1") {
    const info = eol ?? { label: "Magento 1.x", eol: data.eolBranches["1"]?.eol };
    return {
      result: "fail",
      riskRating: "high",
      resultString: `End-of-life: ${info.label} — no security updates since ${info.eol}`,
      indicators: `${label.trim()} · upgrade to ${latest}`,
    };
  }

  // 2. Precise version known: check EOL of the minor line + confirmed CVEs.
  if (v.precision !== "branch") {
    const line = data.minorLines[minorKey(v)];
    const confirmed = data.vulnerabilities.filter((x) => isAffected(v, x, platform));
    const crit = confirmed.filter((x) => x.severity === "critical" || x.severity === "high");

    if (line?.status === "eol") {
      return {
        result: "fail",
        riskRating: "high",
        resultString: `End-of-life release: ${label.trim()} (latest ${latest})`,
        indicators: confirmed.length ? `exposed to ${confirmed.map(vulnName).join(", ")}` : `upgrade to ${latest}`,
      };
    }
    if (crit.length) {
      return {
        result: "fail",
        riskRating: "high",
        resultString: `Vulnerable: ${crit.map(vulnName).join(", ")}`,
        indicators: `${label.trim()} · patch to ${line?.latestPatch ?? latest}`,
      };
    }
    // Behind the latest patch for its line, but no known critical CVE.
    const lineLatest = line ? parseVersion(line.latestPatch) : null;
    if (lineLatest && compare(v, lineLatest) < 0) {
      return {
        result: "fail",
        riskRating: "medium",
        resultString: `Outdated patch level: ${label.trim()} (latest for this line is ${line!.latestPatch})`,
        indicators: `newest overall is ${latest}`,
      };
    }
    return { result: "ok", riskRating: "low", resultString: `Up to date (${label.trim()})`, indicators: `latest ${latest}` };
  }

  // 3. Branch-only detection (the common case via /magento_version): supported
  // branch, but patch level unknown. Advisory, not a hard verdict.
  const possible = data.vulnerabilities
    .filter((x) => x.platforms.includes(platform) && (x.severity === "critical" || x.severity === "high"))
    .map(vulnName);
  return {
    result: "unknown",
    riskRating: "medium",
    resultString: `Magento ${branch}.x — patch level not disclosed; confirm you're on ${latest}`,
    indicators: possible.length ? `possible if unpatched: ${possible.join(", ")}` : `latest ${latest}`,
  };
}
