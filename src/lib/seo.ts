import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import type { FeaturedImage } from "@/lib/types";

/**
 * The public origin used when `NEXT_PUBLIC_SITE_URL` is unset or unusable.
 * **Every mall must edit this**, like the placeholders in `mall.ts`.
 */
const DEFAULT_SITE_URL = "https://www.animavillage.com";

/**
 * The host `.env.example` ships. A copied env file that still carries it is
 * treated as unset, so it can never reach a canonical.
 */
const PLACEHOLDER_HOST = "your-mall.example.com";

/**
 * Returns the canonical public site origin used by metadata, sitemap, and
 * JSON-LD — the origin only, so a value with a path still yields bare URLs.
 *
 * `NEXT_PUBLIC_SITE_URL` must name this site. Pointing it at the WordPress
 * backend compiles and renders fine, and sends every canonical, hreflang,
 * sitemap entry and relative `og:image` to the backend.
 */
export function getSiteUrl(): URL {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

  try {
    const siteUrl = new URL(rawSiteUrl);
    if (
      !["http:", "https:"].includes(siteUrl.protocol) ||
      siteUrl.hostname === PLACEHOLDER_HOST
    ) {
      return new URL(DEFAULT_SITE_URL);
    }
    return new URL(siteUrl.origin);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

/**
 * How next-intl prefixes this site's URLs, read from `i18n/routing.ts`:
 * `always` (`/es/foo`, next-intl's default), `as-needed` (`/foo` for the
 * default locale, `/en/foo` for the rest) or `never`. Custom per-locale
 * `prefixes` are not supported.
 */
function localePrefixMode(): "always" | "as-needed" | "never" {
  const prefix = routing.localePrefix;
  if (!prefix) return "always";
  return typeof prefix === "string" ? prefix : prefix.mode;
}

/**
 * Builds a localized pathname with the locale prefix expected by next-intl.
 */
export function getLocalizedPath(locale: string, pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const mode = localePrefixMode();

  if (mode === "never" || (mode === "as-needed" && locale === routing.defaultLocale)) {
    return normalizedPath;
  }
  // A locale's root is `/es`, not `/es/`: the trailing slash redirects.
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

/**
 * Builds an absolute localized URL for canonical, Open Graph, and JSON-LD fields.
 */
export function getLocalizedUrl(locale: string, pathname: string): string {
  const siteUrl = getSiteUrl();
  return new URL(getLocalizedPath(locale, pathname), siteUrl).toString();
}

/**
 * Builds hreflang alternates for the configured locales.
 */
export function getLanguageAlternates(pathname: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, getLocalizedUrl(locale, pathname)])
  );
}

// ------------------------------------------------------------ Share cards --

/** An image in the shape Open Graph metadata takes it. */
export type ShareImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

/** What each mall supplies to {@link createShareMetadata}, from its `mall.ts`. */
export type ShareDefaults = {
  /** `og:site_name`. */
  siteName: string;
  /**
   * Shared by every page without an image of its own: 1200×630, JPEG or PNG.
   * A relative URL resolves against `metadataBase` — `NEXT_PUBLIC_SITE_URL` —
   * so scrapers get a 404 if that variable names anything but this site.
   */
  image: ShareImage;
  /**
   * `og:locale` per site locale, e.g. `{ es: "es_MX", en: "en_US" }`. The
   * region is the mall's, like its timezone. A locale missing here is sent
   * bare.
   */
  ogLocales: Record<string, string>;
};

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** Formats WhatsApp, Facebook, LinkedIn and X all decode; AVIF and SVG are not among them. */
const SCRAPER_SAFE_IMAGE = /\.(jpe?g|png|webp|gif)$/i;

/** A WordPress featured image as a share image, or null when scrapers could not show it. */
function toShareImage(image?: FeaturedImage): ShareImage | null {
  const node = image?.node;
  const path = node?.sourceUrl?.split(/[?#]/)[0];
  if (!node?.sourceUrl || !path || !SCRAPER_SAFE_IMAGE.test(path)) return null;

  return {
    url: node.sourceUrl,
    width: node.mediaDetails?.width ?? undefined,
    height: node.mediaDetails?.height ?? undefined,
    alt: node.altText || undefined,
  };
}

/**
 * Binds the share-card helpers to one mall's {@link ShareDefaults}. Each
 * mall's `mall.ts` calls it once and exports the result, so pages never pass
 * the defaults themselves.
 */
export function createShareMetadata(defaults: ShareDefaults) {
  /**
   * Open Graph for any page: its own WordPress image when it has one in a
   * format scrapers read, otherwise the mall's default image.
   *
   * A page that sets `openGraph` replaces the layout's whole object — Next
   * merges metadata shallowly — so every page goes through here to keep
   * `site_name`, `locale` and the fallback. `og:title` and `og:description`
   * are left out on purpose: Next fills them from the page's own `title` and
   * `description`, and copies all of it to `twitter:*`.
   */
  function openGraph(locale: string, image?: FeaturedImage): OpenGraph {
    return {
      type: "website",
      siteName: defaults.siteName,
      locale: defaults.ogLocales[locale] ?? locale,
      images: [toShareImage(image) ?? defaults.image],
    };
  }

  /**
   * Canonical, hreflang and Open Graph for a public page, all from one path,
   * so the canonical and `og:url` cannot disagree.
   *
   * `og:url` cannot be set once in the layout. A relative `"./"` resolves
   * against the route's pathname, and on pages prerendered at build time
   * that is the internal `/es/...` path next-intl rewrites to, not the public
   * URL — `next dev` hides this. Pages that only inherit the layout's Open
   * Graph get no `og:url`, which is right for private pages.
   */
  function pageMetadata(
    locale: string,
    path: string,
    image?: FeaturedImage,
  ): Pick<Metadata, "alternates" | "openGraph"> {
    const url = getLocalizedUrl(locale, path);

    return {
      alternates: { canonical: url, languages: getLanguageAlternates(path) },
      openGraph: { ...openGraph(locale, image), url },
    };
  }

  return { openGraph, pageMetadata };
}
