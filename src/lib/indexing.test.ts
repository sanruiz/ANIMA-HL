import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOINDEX_HEADER, isIndexableHost, withNoIndexHeader } from "./indexing";

const CANONICAL = "www.mall.example.org";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${CANONICAL}`);
  vi.stubEnv("VERCEL_ENV", "production");
});
afterEach(() => vi.unstubAllEnvs());

describe("isIndexableHost", () => {
  it.each([CANONICAL, "WWW.MALL.EXAMPLE.ORG", `${CANONICAL}.`, `${CANONICAL}:443`])(
    "indexes the canonical host %s on a production deploy",
    (host) => {
      expect(isIndexableHost(host)).toBe(true);
    },
  );

  it.each([
    // A production deploy is also served on Vercel's aliases.
    "mall-website.vercel.app",
    "mall-website-git-main-team.vercel.app",
    // The bare apex is a different host; Vercel redirects it to the canonical.
    "mall.example.org",
    "staging.mall.example.org",
    "localhost:3000",
    "invalid host",
    "",
    null,
    undefined,
  ])("does not index %s even on a production deploy", (host) => {
    expect(isIndexableHost(host)).toBe(false);
  });

  // A preview branch keeps the production NEXT_PUBLIC_SITE_URL, so its own
  // domain can even equal the canonical one: VERCEL_ENV alone must block it.
  it.each(["preview", "development", "", undefined])(
    "does not index the canonical host when VERCEL_ENV is %s",
    (env) => {
      vi.stubEnv("VERCEL_ENV", env);
      expect(isIndexableHost(CANONICAL)).toBe(false);
    },
  );

  it("follows NEXT_PUBLIC_SITE_URL, not a hardcoded host", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://other-mall.example.net/path");
    expect(isIndexableHost("other-mall.example.net")).toBe(true);
    expect(isIndexableHost(CANONICAL)).toBe(false);
  });
});

describe("withNoIndexHeader", () => {
  it("leaves an indexable response untouched and returns the same object", () => {
    const response = new Response(null);
    expect(withNoIndexHeader(response, CANONICAL)).toBe(response);
    expect(response.headers.has(NOINDEX_HEADER.name)).toBe(false);
  });

  it("marks a non-indexable response noindex, nofollow", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = withNoIndexHeader(new Response(null), CANONICAL);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("marks a redirect too", () => {
    const redirect = new Response(null, {
      status: 307,
      headers: { location: "https://mall-website.vercel.app/es" },
    });
    const response = withNoIndexHeader(redirect, "mall-website.vercel.app");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });
});
