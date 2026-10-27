import { describe, expect, it } from "vitest";
import { toHref } from "@/lib/menus";

describe("toHref", () => {
  it("strips the WP Multilang locale prefix so <Link> doesn't double it", () => {
    expect(toHref({ path: "/en/conocenos/", uri: null }, "en")).toBe("/conocenos/");
    expect(toHref({ path: "/en", uri: null }, "en")).toBe("/");
  });

  it("leaves unprefixed and look-alike paths untouched", () => {
    expect(toHref({ path: "/marcas/", uri: null }, "es")).toBe("/marcas/");
    expect(toHref({ path: "/entretenimiento/", uri: null }, "en")).toBe("/entretenimiento/");
  });

  it("falls back to uri, then '#'", () => {
    expect(toHref({ path: null, uri: "https://example.com" }, "en")).toBe("https://example.com");
    expect(toHref({ path: null, uri: null }, "en")).toBe("#");
  });
});
