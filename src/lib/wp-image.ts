/**
 * Utilidades para imágenes servidas por WordPress vía Next Image.
 *
 * Motivación: Next Image Optimizer bloquea URLs que resuelven a IPs privadas
 * (protección anti-SSRF), lo que rompe cualquier página que consuma media del
 * WP de desarrollo en LocalWP (anima-headless.local → 127.0.0.1). En producción
 * el WP vive en un dominio público y el optimizer funciona normalmente,
 * convirtiendo PNGs de 1–2 MB a AVIF/WebP de ~50 KB en el tamaño exacto del
 * viewport. Este helper decide cuándo saltarse el optimizer para no romper el
 * flujo de dev, sin sacrificar la optimización en prod.
 *
 * Se usa en el `unoptimized` prop del `<Image>` de Next y aplica a cualquier
 * sección que renderice imágenes del WP (brands, agenda, noticias, etc.).
 */

type WpImageEnv = {
  NODE_ENV?: string;
};

/**
 * Devuelve true cuando la URL de imagen apunta al WP de desarrollo local
 * (hostname termina en `.local`) y estamos en dev. En cualquier otro caso
 * (prod, dominio público) devuelve false para dejar que el optimizer trabaje.
 *
 * Es tolerante a errores: URLs mal formadas → false (dejar que Next decida).
 *
 * IMPORTANTE — SSR: leemos `process.env.NODE_ENV` DIRECTAMENTE (no vía objeto
 * destructurado) porque webpack/turbopack solo inlinea la variable cuando ve
 * la referencia exacta al bindings; con `process.env` a secas el objeto llega
 * vacío al bundle cliente y el server/client divergen, disparando un
 * "hydration mismatch". El parámetro `env` opcional existe solo para tests.
 */
export function shouldBypassImageOptimizer(
  url: string | null | undefined,
  env?: WpImageEnv
): boolean {
  if (!url) return false;
  const nodeEnv = env?.NODE_ENV ?? process.env.NODE_ENV;
  if (nodeEnv !== "development") return false;
  try {
    return new URL(url).hostname.endsWith(".local");
  } catch {
    return false;
  }
}
