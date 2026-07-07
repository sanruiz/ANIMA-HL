import { routing } from "@/i18n/routing";

const DEFAULT_SITE_URL = "https://www.animavillage.com";

/**
 * Returns the canonical public site origin used by metadata, sitemap, and JSON-LD.
 */
export function getSiteUrl(): URL {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

  try {
    return new URL(rawSiteUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

/**
 * Builds a localized pathname with the locale prefix expected by next-intl.
 */
export function getLocalizedPath(locale: string, pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${normalizedPath}`;
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
