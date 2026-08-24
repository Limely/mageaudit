/**
 * Pure, client-safe domain helpers. Kept free of any server imports (fs, env)
 * so both client components and server code can use them.
 */

/** Strip scheme/www/path down to the bare domain, e.g. "example.com". */
export function bareDomain(input: string): string {
  let s = (input || "").trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    return new URL(s).hostname.replace(/^www\./i, "");
  } catch {
    return input
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .trim();
  }
}
