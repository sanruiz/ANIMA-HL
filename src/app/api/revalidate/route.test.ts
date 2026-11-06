import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ALL_TAGS } from "@/lib/cache-tags";

const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (tag: string, profile: unknown) => revalidateTag(tag, profile),
}));

const { POST } = await import("@/app/api/revalidate/route");

const SECRET = "test-secret";

function request(body: unknown, secret?: string): Request {
  return new Request("https://example.com/api/revalidate", {
    method: "POST",
    headers: secret ? { "x-revalidate-secret": secret } : {},
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    process.env.REVALIDATE_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
  });

  it("invalidates the tags for a content change", async () => {
    const response = await POST(request({ type: "brand", slug: "nike" }, SECRET));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
      tags: ["wp:brands", "wp:brand:nike"],
    });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith("wp:brands", { expire: 0 });
  });

  it("revalidates the deal collection and item tags for a valid deal payload", async () => {
    const response = await POST(request({ type: "deal", slug: "summer-sale" }, SECRET));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.revalidated).toBe(true);
    expect(json.tags).toEqual(["wp:deals", "wp:deal:summer-sale"]);
    expect(revalidateTag).toHaveBeenCalledWith("wp:deals", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("wp:deal:summer-sale", { expire: 0 });
  });

  it("rejects a request with no secret", async () => {
    const response = await POST(request({ type: "brand" }));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  // The secret travels only in the header: in a URL it would land in access
  // logs and the Vercel dashboard. A mall once accepted `?secret=` too.
  it("ignores a secret sent in the query string", async () => {
    const response = await POST(
      new Request(`https://example.com/api/revalidate?secret=${SECRET}`, {
        method: "POST",
        body: JSON.stringify({ type: "brand" }),
      })
    );

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("exposes no GET handler a browser could trigger", async () => {
    const route: Record<string, unknown> = await import("@/app/api/revalidate/route");
    expect(route.GET).toBeUndefined();
  });

  it("rejects a wrong secret", async () => {
    const response = await POST(request({ type: "brand" }, "nope"));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a secret of the same length as the real one", async () => {
    const response = await POST(request({ type: "brand" }, "x".repeat(SECRET.length)));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is not configured", async () => {
    delete process.env.REVALIDATE_SECRET;

    const response = await POST(request({ type: "brand" }, SECRET));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 400 when the payload has nothing actionable", async () => {
    const response = await POST(request({ type: "widget" }, SECRET));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 400 for an unparseable body instead of throwing", async () => {
    const response = await POST(request("{not json", SECRET));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("invalidates every collection tag when all is true", async () => {
    const response = await POST(request({ all: true }, SECRET));

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(ALL_TAGS.length);
  });
});
