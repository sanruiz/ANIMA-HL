/**
 * WPGraphQL client using native fetch.
 *
 * Why fetch and not graphql-request or Apollo? In App Router with Server
 * Components, native fetch supports Next.js's cache/ISR directly (the
 * `next.revalidate` option) — zero extra dependencies. graphql-request would
 * be syntactic sugar; Apollo adds a client-side cache we don't need here. If
 * you ever want either, this is the only file to change.
 *
 * Bilingual (WP Multilang): the locale is passed as ?lang=es|en on the
 * endpoint URL. Every query receives `locale` and asks for content in that
 * language.
 */

const ENDPOINT =
  process.env.WORDPRESS_API_URL ?? "https://mall-headless.local/graphql";

type FetchArgs = {
  query: string;
  variables?: Record<string, unknown>;
  /** Language for WP Multilang (?lang=). */
  locale?: string;
  /** ISR revalidation in seconds. 0 = no cache. */
  revalidate?: number;
  /**
   * Cache tags for on-demand invalidation with revalidateTag().
   * Always paired with revalidate as a time-based fallback.
   */
  tags?: string[];
};

export async function fetchGraphQL<T>({
  query,
  variables,
  locale,
  revalidate = 60,
  tags,
}: FetchArgs): Promise<T> {
  const url = locale ? `${ENDPOINT}?lang=${encodeURIComponent(locale)}` : ENDPOINT;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate, ...(tags?.length ? { tags } : {}) },
  });

  if (!res.ok) {
    throw new Error(`WPGraphQL responded ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(" | "));
  }

  if (!json.data) {
    throw new Error("WPGraphQL returned no data.");
  }

  return json.data;
}
