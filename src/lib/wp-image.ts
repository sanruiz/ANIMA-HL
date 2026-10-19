/**
 * Utilities for images served by WordPress via next/image.
 *
 * Motivation: Next Image Optimizer blocks URLs that resolve to private IPs
 * (anti-SSRF protection), which breaks any page consuming media from a local
 * WordPress dev install (e.g. mall-headless.local → 127.0.0.1). In production
 * WordPress lives on a public domain and the optimizer works normally. This
 * helper decides when to bypass the optimizer so dev isn't broken, without
 * giving up optimization in prod.
 *
 * Used in the `unoptimized` prop of next/image's <Image> for any section
 * that renders WordPress media.
 */

type WpImageEnv = {
  NODE_ENV?: string;
};

/** Serve local WordPress uploads through Next so LAN clients need no local DNS. */
export function getWpImageSrc(url: string): string {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.endsWith(".local") &&
      /^https?:$/.test(parsed.protocol) &&
      parsed.pathname.startsWith("/wp-content/uploads/")
    ) {
      return `/assets/${parsed.pathname.slice("/wp-content/".length)}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Relative image paths already use the frontend origin.
  }
  return url;
}

/**
 * Returns true when the image URL points at a local dev WordPress (hostname
 * ends in `.local`) and we're in dev. Anywhere else (prod, public domain)
 * returns false so the optimizer can do its job.
 *
 * Tolerant of malformed URLs: returns false and lets Next decide.
 *
 * IMPORTANT — SSR: we read `process.env.NODE_ENV` directly (not via a
 * destructured object) because webpack/turbopack only inlines the variable
 * when it sees the exact binding reference; with a bare `process.env` the
 * object arrives empty on the client bundle and server/client diverge,
 * triggering a hydration mismatch. The optional `env` parameter exists only
 * for tests.
 */
export function shouldBypassImageOptimizer(
  url: string | null | undefined,
  env?: WpImageEnv
): boolean {
  if (!url) return false;
  const nodeEnv = env?.NODE_ENV ?? process.env.NODE_ENV;
  if (nodeEnv !== "development") return false;
  try {
    return new URL(url).hostname.endsWith(".local");
  } catch {
    return false;
  }
}
