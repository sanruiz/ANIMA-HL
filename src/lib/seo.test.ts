import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getLanguageAlternates,
  getLocalizedPath,
  getLocalizedUrl,
  getSiteUrl,
} from "./seo";

// Written against ANIMA's own configuration rather than ported from the
// starter's antara branch: that suite asserts a single-locale site with
// `localePrefix: "as-needed"` and Antara's domain, none of which hold here.
const SITE = "https://www.animavillage.com";

afterEach(() => vi.unstubAllEnvs());

describe("getSiteUrl", () => {
  it("uses the configured origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
    expect(getSiteUrl().origin).toBe(SITE);
  });

  it("keeps a path in the configured value instead of reducing it", () => {
    // Documents current behaviour, not a preference. main's getSiteUrl
    // returns `new URL(raw)` as-is; the starter's antara branch normalizes to
    // the origin. It stays harmless because getLocalizedUrl resolves an
    // absolute path against this base and so drops the extra segment — but a
    // direct getSiteUrl().href would carry it, so set the variable to a bare
    // origin.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.animavillage.com/es/brands");
    expect(getSiteUrl().href).toBe(`${SITE}/es/brands`);
    expect(getLocalizedUrl("en", "/blog")).toBe(`${SITE}/en/blog`);
  });

  it.each([undefined, "", "not-a-url", "/relative"])(
    "falls back to the shared-core placeholder when the value is %s",
    (value) => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
      // Deliberately the generic placeholder: seo.ts is a core file, so it
      // carries no mall's domain. This asserts the deployment contract —
      // NEXT_PUBLIC_SITE_URL is required, and without it canonicals point at
      // example.com rather than silently at the right site.
      expect(getSiteUrl().origin).toBe("https://your-mall.example.com");
    }
  );
});

describe("getLocalizedPath", () => {
  it("always prefixes the locale, in both languages", () => {
    expect(getLocalizedPath("es", "/brands")).toBe("/es/brands");
    expect(getLocalizedPath("en", "/brands")).toBe("/en/brands");
  });

  it("adds the leading slash when the caller omits it", () => {
    expect(getLocalizedPath("es", "brands")).toBe("/es/brands");
  });

  it("keeps the bare locale path for the home page", () => {
    expect(getLocalizedPath("en", "/")).toBe("/en/");
  });
});

describe("getLocalizedUrl", () => {
  it("builds an absolute URL on the configured origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
    expect(getLocalizedUrl("es", "/agenda")).toBe(`${SITE}/es/agenda`);
    expect(getLocalizedUrl("en", "/agenda")).toBe(`${SITE}/en/agenda`);
  });
});

describe("getLanguageAlternates", () => {
  it("advertises both locales ANIMA publishes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
    expect(getLanguageAlternates("/blog")).toEqual({
      es: `${SITE}/es/blog`,
      en: `${SITE}/en/blog`,
    });
  });
});
