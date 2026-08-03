/**
 * Cache tags shared by the WordPress data fetches and the on-demand
 * revalidation endpoint.
 *
 * Tags are the contract between two codebases: the Next.js pages that attach
 * them to `fetch` and the WordPress plugin that names them when content
 * changes. A typo on either side fails silently — the page simply keeps
 * serving stale data until the time-based fallback expires — so every tag is
 * built here instead of being written as a literal at each call site.
 *
 * Tags are language-agnostic on purpose: `/es` and `/en` share the same tag so
 * a single invalidation refreshes both locales.
 */

export const CONTENT_TYPES = ["brand", "event", "post", "page"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

const COLLECTION_TAGS: Record<ContentType, string> = {
  brand: "wp:brands",
  event: "wp:events",
  page: "wp:pages",
  post: "wp:posts",
};

/** Tag for media proxied through `/assets`. */
export const ASSETS_TAG = "wp:assets";

/** Every collection-level tag, used when invalidating the whole site. */
export const ALL_TAGS: readonly string[] = [
  ...Object.values(COLLECTION_TAGS),
  ASSETS_TAG,
];

/**
 * Tag covering every entry of a content type (listings, sitemap, carousels).
 *
 * @param type Content type to tag.
 * @returns The collection tag, for example `wp:brands`.
 */
export function collectionTag(type: ContentType): string {
  return COLLECTION_TAGS[type];
}

/**
 * Tag covering a single entry, so editing one item does not invalidate all.
 *
 * @param type       Content type to tag.
 * @param identifier Slug for brands, events and posts; URI path for pages.
 * @returns The item tag, for example `wp:brand:nike`.
 */
export function itemTag(type: ContentType, identifier: string): string {
  return `wp:${type}:${identifier}`;
}

/**
 * Type guard for values arriving from outside the app (request payloads).
 *
 * @param value Unknown value to narrow.
 * @returns Whether the value is a supported content type.
 */
export function isContentType(value: unknown): value is ContentType {
  return (
    typeof value === "string" &&
    (CONTENT_TYPES as readonly string[]).includes(value)
  );
}
