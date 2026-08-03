/**
 * Pure request-payload handling for the on-demand revalidation endpoint.
 *
 * Kept apart from the route handler so the parsing and validation rules can be
 * unit tested without a running server or a real Next.js cache. The endpoint is
 * reachable from the public internet, so anything arriving here is treated as
 * untrusted even after the shared secret has been checked.
 */

import {
  ALL_TAGS,
  collectionTag,
  isContentType,
  itemTag,
} from "@/lib/cache-tags";

/** Shape WordPress posts to `/api/revalidate`. All fields are optional. */
export type RevalidateRequest = {
  /** Content type that changed, e.g. `brand`. */
  type?: string;
  /** Slug of the changed entry, or URI path for pages. */
  slug?: string;
  /** Explicit tags, for callers that already know them. */
  tags?: string[];
  /** Invalidate every collection tag, used by the manual button. */
  all?: boolean;
};

const TAG_PREFIX = "wp:";

/** Next.js rejects tags longer than this. */
const MAX_TAG_LENGTH = 256;

/** Upper bound so a malformed payload cannot queue unbounded work. */
const MAX_TAGS = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTag(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith(TAG_PREFIX) &&
    value.length > TAG_PREFIX.length &&
    value.length <= MAX_TAG_LENGTH
  );
}

/**
 * Turn an untrusted request payload into the list of cache tags to invalidate.
 *
 * Unknown content types and malformed tags are dropped rather than rejected, so
 * one bad field never discards an otherwise valid request. An empty result
 * means nothing actionable was sent and the caller should answer with 400.
 *
 * @param body Parsed JSON body, or any unknown value.
 * @returns Deduplicated tags, capped at a safe maximum.
 */
export function resolveTags(body: unknown): string[] {
  if (!isRecord(body)) return [];

  if (body.all === true) return [...ALL_TAGS];

  const tags = new Set<string>();

  if (isContentType(body.type)) {
    tags.add(collectionTag(body.type));

    const { slug } = body;

    if (typeof slug === "string" && slug.trim() !== "") {
      const candidate = itemTag(body.type, slug.trim());

      if (candidate.length <= MAX_TAG_LENGTH) tags.add(candidate);
    }
  }

  if (Array.isArray(body.tags)) {
    for (const tag of body.tags) {
      if (isValidTag(tag)) tags.add(tag);
    }
  }

  return [...tags].slice(0, MAX_TAGS);
}
