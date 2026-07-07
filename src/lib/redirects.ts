/**
 * Redirects 301 de las URLs legadas de la sección de noticias hacia /blog.
 *
 * Dos familias de orígenes:
 * - `/news[...]`: URLs de producción del sitio Webflow (EN sin prefijo de
 *   locale; ES bajo /es/). Deben conservar el SEO acumulado tras el cutover
 *   Webflow → Vercel.
 * - `/noticias[...]`: ruta previa de este repo antes del rename a /blog.
 *
 * Se usa `statusCode: 301` explícito (no `permanent: true`, que emite 308):
 * el requisito del cutover es un 301 clásico.
 *
 * Las variantes sin prefijo de locale redirigen a `/blog[...]` "pelado"; el
 * middleware de next-intl (src/proxy.ts) les añade después el locale
 * detectado. Los redirects de next.config corren ANTES del middleware, así
 * que también aplican con el modo coming-soon activo.
 */

type LegacyRedirect = {
  source: string;
  destination: string;
  statusCode: 301;
};

export const NEWS_TO_BLOG_REDIRECTS: LegacyRedirect[] = [
  // URLs de producción Webflow.
  { source: "/news", destination: "/blog", statusCode: 301 },
  { source: "/news/:path*", destination: "/blog/:path*", statusCode: 301 },
  {
    source: "/:locale(es|en)/news",
    destination: "/:locale/blog",
    statusCode: 301,
  },
  {
    source: "/:locale(es|en)/news/:path*",
    destination: "/:locale/blog/:path*",
    statusCode: 301,
  },
  // Ruta previa del repo.
  { source: "/noticias", destination: "/blog", statusCode: 301 },
  { source: "/noticias/:path*", destination: "/blog/:path*", statusCode: 301 },
  {
    source: "/:locale(es|en)/noticias",
    destination: "/:locale/blog",
    statusCode: 301,
  },
  {
    source: "/:locale(es|en)/noticias/:path*",
    destination: "/:locale/blog/:path*",
    statusCode: 301,
  },
];
