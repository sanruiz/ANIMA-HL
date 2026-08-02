import { describe, expect, it } from "vitest";
import { ALL_TAGS } from "@/lib/cache-tags";
import { resolveTags } from "@/lib/revalidation";

describe("resolveTags", () => {
  it("returns the collection and item tag for a content change", () => {
    expect(resolveTags({ type: "brand", slug: "nike" })).toEqual([
      "wp:brands",
      "wp:brand:nike",
    ]);
  });

  it("returns only the collection tag when no slug is sent", () => {
    expect(resolveTags({ type: "event" })).toEqual(["wp:events"]);
  });

  it("ignores blank slugs instead of building an empty item tag", () => {
    expect(resolveTags({ type: "post", slug: "   " })).toEqual(["wp:posts"]);
  });

  it("trims surrounding whitespace from slugs", () => {
    expect(resolveTags({ type: "page", slug: " about " })).toEqual([
      "wp:pages",
      "wp:page:about",
    ]);
  });

  it("returns every collection tag when all is true", () => {
    expect(resolveTags({ all: true })).toEqual([...ALL_TAGS]);
  });

  it("accepts explicit tags alongside a content change", () => {
    expect(
      resolveTags({ type: "brand", slug: "nike", tags: ["wp:assets"] })
    ).toEqual(["wp:brands", "wp:brand:nike", "wp:assets"]);
  });

  it("drops tags that are not namespaced under wp:", () => {
    expect(resolveTags({ tags: ["posts", "wp:posts", ""] })).toEqual([
      "wp:posts",
    ]);
  });

  it("drops the wp: prefix on its own", () => {
    expect(resolveTags({ tags: ["wp:"] })).toEqual([]);
  });

  it("drops tags longer than the Next.js limit", () => {
    const tooLong = `wp:${"a".repeat(300)}`;
    expect(resolveTags({ tags: [tooLong] })).toEqual([]);
  });

  it("deduplicates repeated tags", () => {
    expect(resolveTags({ type: "post", tags: ["wp:posts", "wp:posts"] })).toEqual(
      ["wp:posts"]
    );
  });

  it("ignores unknown content types", () => {
    expect(resolveTags({ type: "deal", slug: "x" })).toEqual([]);
  });

  it("keeps valid tags when the content type is unknown", () => {
    expect(resolveTags({ type: "deal", tags: ["wp:brands"] })).toEqual([
      "wp:brands",
    ]);
  });

  it.each([null, undefined, "brand", 42, [], { tags: "wp:posts" }])(
    "returns no tags for the malformed payload %o",
    (payload) => {
      expect(resolveTags(payload)).toEqual([]);
    }
  );

  it("caps the number of tags", () => {
    const many = Array.from({ length: 80 }, (_, i) => `wp:brand:b${i}`);
    expect(resolveTags({ tags: many })).toHaveLength(50);
  });
});
