import { defineRouting } from "next-intl/routing";

/**
 * ANIMA's languages and URL shape. Like `mall.ts`, this file belongs to the
 * mall, not the core: ANIMA keeps both languages always on and the `/es`
 * prefix, so it does not read the starter's ENABLE_ENGLISH switch. Never take
 * the starter's copy over this one.
 */
export const routing = defineRouting({
  // Site languages. Must match the languages configured in WP Multilang Pro
  // on the WordPress side — minimum 1, maximum 2 per mall (see
  // docs/REPLICABLE-MALLS-PLATFORM-OUTLINE.md §15.1.3).
  locales: ["es", "en"],
  // Default language.
  defaultLocale: "es",
});

export type Locale = (typeof routing.locales)[number];
