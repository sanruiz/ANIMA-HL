import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * WordPress HTML as plain text: tags removed, entities decoded, whitespace
 * collapsed. Meant for text React renders or a meta tag carries — React
 * escapes it again, so an entity left encoded reaches the reader literally
 * (`AT&amp;T`, `[&hellip;]`).
 *
 * Tags go before entities are decoded, so `&lt;b&gt;` written as text stays
 * `<b>` instead of being taken for a tag. Never feed the result to
 * `dangerouslySetInnerHTML`: it is text, and may now contain `<`.
 */
export function stripHtml(html: string | null): string {
  if (!html) return "";
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The named entities WordPress and its editors produce. `wptexturize` writes
 * curly quotes and dashes as numeric entities, which need no entry here, but
 * the excerpt's `[&hellip;]` is named, and pasted text brings the rest.
 *
 * A hand list rather than a library: a dependency would have to be added to
 * every mall's package.json, and the core travels as copied files. Lookup is
 * case-sensitive (`&Aacute;` is not `&aacute;`); an unlisted code falls back
 * to its lowercase form, so `&AMP;` still decodes.
 */
const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  ldquo: "“",
  rdquo: "”",
  bdquo: "„",
  laquo: "«",
  raquo: "»",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  euro: "€",
  deg: "°",
  iexcl: "¡",
  iquest: "¿",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  Ntilde: "Ñ",
  Uuml: "Ü",
};

const WORDPRESS_ASSET_PATTERN =
  /(?:(?:https?:)?\/\/[^"'()<>\s]+)?\/wp-content\/(?:uploads|plugins|themes)\/[^"'()<>\s]+/gi;

/**
 * Decodes the HTML entities commonly returned by WordPress titles and excerpts.
 */
export function decodeHtmlEntities(value: string | null | undefined): string {
  if (!value) return "";

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x")) {
      const charCode = Number.parseInt(code.slice(2), 16);
      return Number.isNaN(charCode) ? entity : String.fromCodePoint(charCode);
    }

    if (code.startsWith("#")) {
      const charCode = Number.parseInt(code.slice(1), 10);
      return Number.isNaN(charCode) ? entity : String.fromCodePoint(charCode);
    }

    return HTML_ENTITY_MAP[code] ?? HTML_ENTITY_MAP[code.toLowerCase()] ?? entity;
  });
}

/**
 * Converts a catch-all Next.js route segment array into the URI expected by
 * WPGraphQL's `page(idType: URI)` lookup.
 */
export function buildWordPressUriPath(uri: string[] | undefined): string | null {
  if (!uri?.length) return null;

  const segments = uri
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean);

  if (!segments.length) return null;

  return `/${segments.join("/")}`;
}

/**
 * Rewrites WordPress asset URLs in rendered HTML to the local Next.js asset
 * proxy, keeping WordPress infrastructure hidden from public pages.
 */
export function transformContentToAssetProxy(content: string | null): string {
  if (!content) return "";

  return content.replace(WORDPRESS_ASSET_PATTERN, (assetUrl) => {
    try {
      const parsedUrl = new URL(assetUrl, "https://wordpress.local");
      const marker = "/wp-content/";
      const markerIndex = parsedUrl.pathname.indexOf(marker);

      if (markerIndex === -1) return assetUrl;

      const assetPath = parsedUrl.pathname.slice(markerIndex + marker.length);
      return `/assets/${assetPath}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return assetUrl;
    }
  });
}

/**
 * Formats an ISO date as "May 2026" / "Mayo 2026": long month plus year,
 * capitalized, in UTC to avoid server/client timezone drift.
 */
export function formatMonthYear(
  dateISO: string | null | undefined,
  locale: string
): string {
  if (!dateISO) return "";
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`.trim();
}

/**
 * Joins a brand's ACF `days` and `time` fields into a single "Hours" line
 * (e.g. "Monday to Sunday: 11:00 AM – 8:00 PM"). Empty unless both fields
 * are present.
 */
export function formatBrandHours(
  days: string | null | undefined,
  time: string | null | undefined
): string {
  if (!days || !time) return "";
  return `${days}: ${time}`;
}

const PET_FRIENDLY_TRUTHY = new Set(["si", "sí", "yes", "true", "1"]);

/**
 * Whether a brand admits pets.
 *
 * Needs normalizing because ACF exposes `petfriendly` as a select array
 * (`["si"]` / `["no"]`), and an array is always truthy — so testing the raw
 * field marks *every* brand as pet friendly, including the ones answering
 * "no". Older installs expose the same field as a plain string, boolean or
 * number, hence the other branches.
 */
export function isPetFriendly(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(isPetFriendly);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string")
    return PET_FRIENDLY_TRUTHY.has(value.trim().toLowerCase());
  return false;
}
