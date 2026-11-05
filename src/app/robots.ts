import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isIndexableHost } from "@/lib/indexing";
import { getSiteUrl } from "@/lib/seo";

/**
 * Crawl rules by request host, so staging, dev and PR previews stay blocked
 * even though they keep the production `NEXT_PUBLIC_SITE_URL`. The rule itself
 * is `isIndexableHost` in `lib/indexing.ts`.
 *
 * This is the secondary guard: `Disallow` stops crawling, not indexing. What
 * keeps those URLs out of search results is the `X-Robots-Tag` header that
 * `proxy.ts` adds through `withNoIndexHeader`.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");

  if (!isIndexableHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
