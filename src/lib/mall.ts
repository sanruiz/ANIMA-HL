import type { CalendarMall } from "@/lib/event-calendar";
import { createShareMetadata, type ShareImage } from "@/lib/seo";

/**
 * ANIMA's own identity, kept out of the shared core modules that consume it.
 * Exported as `MALL`, the name the core's files import, so taking a core file
 * from the starter needs no edit here.
 *
 * The long-term home for these values is `mallSettings` in WordPress, which
 * already holds the name and address. They live here meanwhile because the
 * .ics route builds its response synchronously and a second GraphQL round
 * trip per download buys nothing while the values are this stable.
 */
export const MALL: CalendarMall = {
  name: "Ánima Village",
  address: "Ánima Village, Cabo Del Sol, Cabo San Lucas, B.C.S., 23455, México",
  // Baja California Sur runs on Mountain time and has not observed DST since
  // 2022 — an hour behind Mexico City, which is what the starter hardcoded.
  timeZone: "America/Mazatlan",
};

/**
 * What a shared link shows when its page has no image of its own: the home
 * video's poster frame (`public/videohome-poster.jpg`, the "ÁNIMA VILLAGE"
 * stone sign) cropped to 1200×630 from the centre. JPEG, because link
 * scrapers do not reliably decode AVIF.
 *
 * When the picture changes, give the file a new name: Facebook and WhatsApp
 * cache a share image by its URL, so new bytes at an old URL can keep showing
 * the old picture.
 */
export const MALL_SHARE_IMAGE: ShareImage = {
  url: "/images/og-home.jpg",
  width: 1200,
  height: 630,
  alt: MALL.name,
};

/**
 * Open Graph and canonical helpers bound to ANIMA — see `createShareMetadata`
 * in the core's `seo.ts`. The layout uses `mallOpenGraph(locale)` as every
 * page's default; each public page spreads `mallPageMetadata(locale, path,
 * image?)` into its metadata.
 */
export const { openGraph: mallOpenGraph, pageMetadata: mallPageMetadata } =
  createShareMetadata({
    siteName: MALL.name,
    image: MALL_SHARE_IMAGE,
    ogLocales: { es: "es_MX", en: "en_US" },
  });
