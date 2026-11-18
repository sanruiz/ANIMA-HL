/**
 * On-demand cache invalidation, called by the sanruiz-mall-core plugin
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

type AuthResult = "ok" | "unconfigured" | "missing" | "mismatch";

/**
 * Why each rejection is logged. The plugin sends without waiting for the
 * answer, so a 401 here is invisible on the WordPress side: this log is the
 * only place a wrong secret, or a request reaching a deployment that has no
 * secret (a preview, an old domain), ever shows up.
 */
const REJECTION_REASONS: Record<Exclude<AuthResult, "ok">, string> = {
  unconfigured: "REVALIDATE_SECRET is not set in this environment",
  missing: `no ${SECRET_HEADER} header`,
  mismatch: `${SECRET_HEADER} does not match REVALIDATE_SECRET`,
};

/**
 * Compare the request secret against the configured one in constant time.
 *
 * Reports "unconfigured" when `REVALIDATE_SECRET` is unset so a misconfigured
 * deployment fails closed instead of exposing an open invalidation endpoint.
 *
 * @param request Incoming request.
 * @returns "ok", or why the request is not authorized.
 */
function authorize(request: Request): AuthResult {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) return "unconfigured";

  const provided = request.headers.get(SECRET_HEADER);

  if (!provided) return "missing";

  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  // timingSafeEqual throws on length mismatch, so compare lengths first.
  if (providedBuffer.length !== expectedBuffer.length) return "mismatch";

  return timingSafeEqual(providedBuffer, expectedBuffer) ? "ok" : "mismatch";
}

/**
 * Invalidate the cache tags derived from the request payload.
 *
 * @param request Incoming request with a JSON body.
 * @returns JSON describing which tags were invalidated.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = authorize(request);

  if (auth !== "ok") {
    // Never log the presented value: a near-miss secret is still a secret.
    console.warn(
      `[revalidate] rejected: ${REJECTION_REASONS[auth]} (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"})`
    );
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
    console.warn("[revalidate] rejected: no valid tags in payload");
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

  // One line per accepted request: evidence that WordPress reaches this
  // deployment, which an absence of errors cannot give.
  console.info(`[revalidate] ${tags.join(" ")}`);

  return Response.json({ revalidated: true, tags, now: Date.now() });
}
