import { getSiteUrl } from "@/lib/seo";

/**
 * Whether search engines may index what this deploy serves.
 *
 * A response is indexable only when **both** hold:
 *
 * 1. `VERCEL_ENV` is `production`. Vercel sets it on every deploy: `preview`
 *    for every branch that is not the production one (staging, dev, PRs) and
 *    `production` for the production branch. It is absent locally and on any
 *    other host, so those fail safe to noindex.
 * 2. The request's host is the canonical host from `NEXT_PUBLIC_SITE_URL`.
 *    A production deploy is also served on `*.vercel.app` aliases, and those
 *    carry `VERCEL_ENV=production` too.
 *
 * Neither is enough alone. A preview branch keeps the production
 * `NEXT_PUBLIC_SITE_URL` (so its canonicals point at the real site), and a
 * custom domain on a preview branch is just another host. `NODE_ENV` cannot
 * separate them either: it is `production` in every built deploy.
 *
 * A self-hosted production deploy has no `VERCEL_ENV` and would stay noindex.
 * Every mall runs on Vercel today; a mall that moves has to change this rule.
 */
export function isIndexableHost(host: string | null | undefined): boolean {
  if (process.env.VERCEL_ENV !== "production") return false;

  const hostname = toHostname(host);
  return hostname !== null && hostname === toHostname(getSiteUrl().host);
}

/** The header a non-indexable response carries. It reaches search engines that
 * a `Disallow` in robots.txt does not stop: those still list a URL they find
 * through a link, and never see a `noindex` on a page they cannot crawl. */
export const NOINDEX_HEADER = {
  name: "X-Robots-Tag",
  value: "noindex, nofollow",
} as const;

/**
 * Adds `X-Robots-Tag: noindex, nofollow` to a proxy response unless the
 * request may be indexed. Each mall's `proxy.ts` wraps its response with it,
 * whatever else that proxy composes (a coming-soon gate, redirects):
 *
 * ```ts
 * return withNoIndexHeader(intlProxy(request), request.headers.get("host"));
 * ```
 */
export function withNoIndexHeader<T extends { headers: Headers }>(
  response: T,
  host: string | null | undefined,
): T {
  if (!isIndexableHost(host)) {
    response.headers.set(NOINDEX_HEADER.name, NOINDEX_HEADER.value);
  }
  return response;
}

/** The lowercase hostname of a `Host` header value, without port or trailing
 * dot; `null` when there is none or it does not parse. */
function toHostname(host: string | null | undefined): string | null {
  if (!host) return null;
  try {
    return new URL(`http://${host}`).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}
