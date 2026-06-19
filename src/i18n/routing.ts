import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Idiomas del sitio. Coinciden con los locales de WP Multilang.
  locales: ["es", "en"],
  // Idioma por defecto (ajústalo si tu primario en WP es EN).
  defaultLocale: "es",
});

export type Locale = (typeof routing.locales)[number];
