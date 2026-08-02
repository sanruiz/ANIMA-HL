/**
 * On-demand cache invalidation, called by the SOMA Malls Content Types plugin
 * whenever content changes in WordPress.
 *
 * Pages fetch with a one hour `revalidate` as a safety net; this endpoint is
 * what makes an edit show up in seconds instead. It is deliberately additive —
 * if the call never arrives, the site still refreshes on the hourly tier.
 *
 * Auth is a shared secret in a header rather than a query string, so the value
 * does not end up in access logs or the Vercel dashboard URL list.
 */

import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { resolveTags } from "@/lib/revalidation";

// timingSafeEqual and Buffer need the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET_HEADER = "x-revalidate-secret";

/**
 * Compare the request secret against the configured one in constant time.
 *
 * Returns false when `REVALIDATE_SECRET` is unset so a misconfigured
 * deployment fails closed instead of exposing an open invalidation endpoint.
 *
 * @param request Incoming request.
 * @returns Whether the caller presented the correct secret.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) return false;

  const provided = request.headers.get(SECRET_HEADER) ?? "";
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Invalidate the cache tags derived from the request payload.
 *
 * @param request Incoming request with a JSON body.
 * @returns JSON describing which tags were invalidated.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return Response.json(
      { revalidated: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown = null;

  try {
    body = await request.json();
  } catch {
    // An unparseable body is handled below as "nothing to revalidate".
  }

  const tags = resolveTags(body);

  if (tags.length === 0) {
    return Response.json(
      { revalidated: false, message: "No valid tags in payload" },
      { status: 400 }
    );
  }

  // `expire: 0` is the documented profile for webhooks: the next visitor gets
  // fresh content rather than the stale-while-revalidate behaviour of "max".
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true, tags, now: Date.now() });
}
