import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeaturedImage } from "./types";

// Each mall has its own routing, so these tests set it rather than read it.
const routing = vi.hoisted(() => ({
  locales: ["es", "en"] as string[],
  defaultLocale: "es",
  localePrefix: undefined as unknown,
}));
vi.mock("@/i18n/routing", () => ({ routing }));

import {
  createShareMetadata,
  getLanguageAlternates,
  getLocalizedPath,
  getLocalizedUrl,
  getSiteUrl,
  type ShareDefaults,
} from "./seo";

afterEach(() => {
  vi.unstubAllEnvs();
  routing.locales = ["es", "en"];
  routing.localePrefix = undefined;
});

/** What `getSiteUrl` falls back to — each mall's own `DEFAULT_SITE_URL`, so derived, not spelled. */
function fallbackOrigin() {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
  const href = getSiteUrl().href;
  vi.unstubAllEnvs();
  return href;
}

describe("getSiteUrl", () => {
  it("falls back to an https origin", () => {
    expect(fallbackOrigin()).toMatch(/^https:\/\/[^/]+\/$/);
  });

  it.each(["", "invalid", "ftp://mall.example.org", "https://your-mall.example.com"])(
    "ignores an unusable NEXT_PUBLIC_SITE_URL: %s",
    (value) => {
      const fallback = fallbackOrigin();
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
      expect(getSiteUrl().href).toBe(fallback);
    },
  );

  it("keeps only the origin of a configured URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mall.example.org/some/path?x=1");
    expect(getSiteUrl().href).toBe("https://mall.example.org/");
  });

  it("accepts local development URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    expect(getSiteUrl().href).toBe("http://localhost:3000/");
  });
});

describe("getLocalizedPath", () => {
  it("prefixes every locale by default, as next-intl does", () => {
    expect(getLocalizedPath("es", "/brands")).toBe("/es/brands");
    expect(getLocalizedPath("en", "deals")).toBe("/en/deals");
    expect(getLocalizedPath("es", "/")).toBe("/es");
  });

  it.each(["as-needed", { mode: "as-needed" }])(
    "leaves the default locale bare with localePrefix %o",
    (localePrefix) => {
      routing.localePrefix = localePrefix;
      expect(getLocalizedPath("es", "/brands")).toBe("/brands");
      expect(getLocalizedPath("es", "/")).toBe("/");
      expect(getLocalizedPath("en", "/brands")).toBe("/en/brands");
      expect(getLocalizedPath("en", "/")).toBe("/en");
    },
  );

  it("never prefixes with localePrefix never", () => {
    routing.localePrefix = "never";
    expect(getLocalizedPath("en", "/brands")).toBe("/brands");
  });
});

describe("getLanguageAlternates", () => {
  it("lists exactly the configured locales", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mall.example.org");
    expect(getLanguageAlternates("/events")).toEqual({
      es: "https://mall.example.org/es/events",
      en: "https://mall.example.org/en/events",
    });

    routing.locales = ["es"];
    expect(Object.keys(getLanguageAlternates("/events"))).toEqual(["es"]);
  });
});

const DEFAULTS: ShareDefaults = {
  siteName: "Test Mall",
  image: { url: "/images/share.jpg", width: 1200, height: 630, alt: "Test Mall" },
  ogLocales: { es: "es_MX" },
};
const { openGraph, pageMetadata } = createShareMetadata(DEFAULTS);

function featured(
  sourceUrl: string | null,
  extra: Partial<NonNullable<NonNullable<FeaturedImage>["node"]>> = {},
): FeaturedImage {
  return { node: { sourceUrl, altText: null, ...extra } };
}

describe("createShareMetadata — openGraph", () => {
  it("falls back to the mall's image when the page has none", () => {
    for (const image of [undefined, null, { node: null }, featured(null)]) {
      expect(openGraph("es", image).images).toEqual([DEFAULTS.image]);
    }
  });

  it("uses the page's own image with its size and alt text", () => {
    const url = "https://cms.example.org/wp-content/uploads/promo.jpg";
    expect(
      openGraph("es", featured(url, { altText: "Promo", mediaDetails: { width: 1920, height: 1080 } })).images,
    ).toEqual([{ url, width: 1920, height: 1080, alt: "Promo" }]);
  });

  it("accepts WebP, PNG and URLs with a query string", () => {
    for (const url of [
      "https://cms.example.org/wp-content/uploads/a.webp",
      "https://cms.example.org/wp-content/uploads/a.PNG",
      "https://cms.example.org/wp-content/uploads/a.jpeg?v=2",
    ]) {
      expect(openGraph("es", featured(url)).images).toEqual([
        { url, width: undefined, height: undefined, alt: undefined },
      ]);
    }
  });

  it("falls back for formats link scrapers don't decode", () => {
    for (const url of [
      "https://cms.example.org/wp-content/uploads/photo.avif",
      "https://cms.example.org/wp-content/uploads/logo.svg",
    ]) {
      expect(openGraph("es", featured(url)).images).toEqual([DEFAULTS.image]);
    }
  });

  it("names the site and maps the locale, sending an unmapped one bare", () => {
    expect(openGraph("es")).toMatchObject({ type: "website", siteName: "Test Mall", locale: "es_MX" });
    expect(openGraph("en").locale).toBe("en");
  });
});

describe("createShareMetadata — pageMetadata", () => {
  it.each([undefined, "as-needed"])("gives og:url the canonical with localePrefix %s", (localePrefix) => {
    routing.localePrefix = localePrefix;
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://mall.example.org");

    for (const path of ["/", "/brands", "/brands/a-brand"]) {
      for (const locale of routing.locales) {
        const { alternates, openGraph: og } = pageMetadata(locale, path);
        expect(alternates?.canonical).toBe(getLocalizedUrl(locale, path));
        expect(og?.url).toBe(alternates?.canonical);
        expect(alternates?.languages).toEqual(getLanguageAlternates(path));
      }
    }
  });

  it("keeps the image, site name and locale", () => {
    const url = "https://cms.example.org/wp-content/uploads/a.jpg";
    const { openGraph: og } = pageMetadata("es", "/deals/a", featured(url));
    expect(og).toMatchObject({ siteName: "Test Mall", locale: "es_MX" });
    expect(og?.images).toEqual([{ url, width: undefined, height: undefined, alt: undefined }]);
    expect(pageMetadata("es", "/about").openGraph?.images).toEqual([DEFAULTS.image]);
  });
});
