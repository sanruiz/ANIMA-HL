import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Site languages. Must match the languages configured in WP Multilang Pro
  // on the WordPress side — minimum 1, maximum 2 per mall (see
  // docs/REPLICABLE-MALLS-PLATFORM-OUTLINE.md §15.1.3).
  locales: ["es", "en"],
  // Default language.
  defaultLocale: "es",
});

export type Locale = (typeof routing.locales)[number];
