# Blog (News) Migration Implementation Plan

Migrar la sección **News** de Webflow (`animavillage.com/news`) a Next.js como
`/blog`, renombrando la ruta actual `/noticias` y preservando SEO con redirects
301 desde las URLs de producción de Webflow.

## Problem Statement

- La sección News vive en Webflow; el resto del sitio se está migrando a
  Next.js headless (WordPress + WPGraphQL). Hay que migrarla con paridad visual.
- La ruta actual del repo es `/noticias` (placeholder sin diseño); la decisión
  de producto es **URL única `/blog` en ambos idiomas** (`/en/blog`, `/es/blog`).
- Las URLs indexadas en producción son `/news` y `/news/[slug]` (EN, sin
  prefijo) y `/es/news[...]` (ES). Hay que redirigir con **301** a `/blog` para
  no perder SEO en el cutover Webflow → Vercel.

## Current Architecture

### Cliente WordPress GraphQL — YA CONFIGURADO ✅

No hay setup pendiente; solo extensiones menores:

| Pieza | Estado |
|---|---|
| [src/lib/wp.ts](../src/lib/wp.ts) | `fetchGraphQL<T>()` con fetch nativo, ISR (`next.revalidate`, default 60 s), idioma vía `?lang=` (WP Multilang). **No soporta `tags`** (requerido por caching.instructions al tocar el archivo). |
| [src/lib/queries.ts](../src/lib/queries.ts) | `NEWS_QUERY` (posts: title, slug, date, excerpt, featuredImage) y `NEWS_BY_SLUG_QUERY` (post: title, date, content, featuredImage) ya existen. |
| [src/lib/types.ts](../src/lib/types.ts) | `PostNode`, `PostSingle`, `NewsResponse`, `NewsBySlugResponse` ya existen. |
| Endpoint | `WORDPRESS_API_URL` en `.env.local` → `https://anima-headless.local/graphql` (LocalWP). Producción vía env de Vercel. |
| [src/lib/wp-image.ts](../src/lib/wp-image.ts) | `shouldBypassImageOptimizer()` para media del WP `.local` en dev. Reusar en las cards. |

### Rutas y navegación actuales

- `src/app/[locale]/(site)/noticias/page.tsx` — listado sin diseño (clases
  `wp-list-*` genéricas), ya consume `NEWS_QUERY`.
- `src/app/[locale]/(site)/noticias/[slug]/page.tsx` — detalle sin diseño, con
  back-link que **no existe en Webflow**.
- `SiteHeader.tsx:20` → `{ key: "blog", href: "/noticias" }`.
- `SiteFooter.tsx:20` → `{ key: "offerNews", href: "/noticias" }`.
- `messages/{en,es}.json` → namespace `news` (title/empty/error). La key
  `home.viewNews` está muerta (sin usos en src).
- **No existe `sitemap.ts`** (hay que crearlo, no actualizarlo).
- `src/proxy.ts` — next-intl + coming-soon. Los `redirects()` de `next.config`
  corren **antes** del middleware, así que el 301 funciona también en modo
  coming-soon.

### Diseño Webflow (verificado contra el HTML/CSS de producción)

**Índice `/news`** — dos secciones, sin hero de imagen, sin filtros ni paginación:

1. **Intro** (`section.intro-text.blog`): bg `--color--claro`, alto 300 px,
   `margin-top: 100px`, contenido centrado:
   - `h3` *itálica* Cardo 48/52 oscuro: EN "What's Happening" / ES "Lo Último".
   - `p2.news` Cardo 24/32 (21/28 ≤767) centrado, con `<em>` y `<br/>`:
     - EN: "Discover the latest *updates, events,<br/>and highlights* from our community"
     - ES: "*Noticias, eventos y más.*<br/>No te pierdas nada"
2. **Grid de cards** (`.news-list`): 3 columnas gap 50 px → 1 columna ≤767.
   Card = link completo: contenedor `aspect-ratio: 2/3`, `height: 600px`,
   `max-height: 70vh`, overflow hidden; imagen cover con tinte oscuro +
   `.gradient-overlay` (transparent → #0006 abajo); texto absoluto al fondo
   centrado (`padding-bottom: 50px`): título Cardo `--color--claro` + fecha
   14 px `#faf7f399` (claro/60). Hover: transición de la imagen (`height .2s`)
   — verificar el efecto exacto contra el sitio vivo al implementar.
   Fecha formato "May 2026" / "Mayo 2026" (mes capitalizado + año).

**Detalle `/news/[slug]`** — tres bloques:

1. **Header** (`section.intro-text.news`, bg claro): contenedor 60 % (95 %
   ≤991): título `h3.blog` Cardo **sin itálica** + fecha `p2.blog` Cardo 24
   centrada; debajo `img-wrapper.blog` (pt 30) con featured image `width:100%`.
2. **Cuerpo** (`section.blog` → `.rich-text-blog`): contenido WP
   (`dangerouslySetInnerHTML`), ancho 60 % → 100 % ≤991. Tipografía editorial:
   párrafos, `<em>`, blockquote itálica, imágenes full-width intercaladas.
3. **Sin** back-link ni related posts (paridad 1:1; el back-link actual de
   `/noticias/[slug]` se elimina).

## Proposed Changes

### Overview

Rename `/noticias` → `/blog` + redirects 301, luego migración visual del índice
y el detalle siguiendo el split híbrido de Brands (BEM canvas en `globals.css`
para intro/header de post/rich-text; Tailwind para el grid de cards), y cierre
SEO (metadata OG, JSON-LD `Article`, `sitemap.ts`).

### Technical Approach

**Componentes nuevos** (archivos planos PascalCase en `src/components/`,
consistentes con el patrón existente de Brands — desviación deliberada de la
regla kebab-case/index.tsx de CLAUDE.md, igual que toda la sección Brands):

| Componente | Estilo | Rol |
|---|---|---|
| `BlogIntro.tsx` | BEM `.blog-intro` | Canvas: heading itálica + lead con `t.rich` (em/br), espejo de `section.intro-text.blog`. Server. |
| `BlogList.tsx` | Tailwind | Grid 3→1 cols + cards (Link + `next/image` fill + gradient overlay + título/fecha). **Server** (sin estado — Brands era client solo por los filtros). |
| `BlogPostHeader.tsx` | BEM `.blog-post-hero` | Título + fecha + featured image del detalle. Server. |
| `JsonLd.tsx` | — | `<script type="application/ld+json">` genérico (patrón de seo-ai-optimization.instructions). |

**Rich text del detalle**: clase BEM `.blog-post__content` en `globals.css` con
selectores descendentes (p, em, blockquote, img, h2/h3) — el HTML viene de WP y
no puede llevar utilidades Tailwind.

**Helper de fecha**: `formatMonthYear(dateISO, locale)` en `src/lib/utils.ts`
(mes long capitalizado + año, `timeZone: "UTC"`), con tests. Se usa en cards y
detalle.

**Cliente GraphQL** (cumplimiento de `caching.instructions.md` al tocar
`src/lib/**`):

- `fetchGraphQL`: añadir param opcional `tags?: string[]` → `next: { revalidate, tags }`.
  No breaking (los llamadores actuales no cambian).
- Fetches del blog: `tags: ["wp:posts"]` (índice) y `["wp:posts", "wp:post:{slug}"]`
  (detalle) + `revalidate: 3600`.
- Páginas `/blog` y `/blog/[slug]`: `export const revalidate = 3600` — el fetch
  a WPGraphQL es POST, y una página con POST-read rinde dinámica salvo que el
  segmento declare su propio ISR (regla 2/2b/5). 1 h (no 30 d) porque **no hay**
  `/api/revalidate` ni webhooks de WP en este repo todavía; se documenta como
  mejora futura.

**Queries**: `NEWS_BY_SLUG_QUERY` gana `excerpt` y `modified` (meta description
y `dateModified` del JSON-LD). Nueva `NEWS_SLUGS_QUERY` ligera para el sitemap.
`PostSingle` se extiende en `types.ts`.

**Redirects** en `next.config.ts` (`statusCode: 301` — el usuario pide 301
explícito; `permanent: true` emitiría 308):

```ts
async redirects() {
  return [
    // URLs de producción Webflow (EN sin prefijo + /es/, /en/)
    { source: "/news", destination: "/blog", statusCode: 301 },
    { source: "/news/:path*", destination: "/blog/:path*", statusCode: 301 },
    { source: "/:locale(es|en)/news", destination: "/:locale/blog", statusCode: 301 },
    { source: "/:locale(es|en)/news/:path*", destination: "/:locale/blog/:path*", statusCode: 301 },
    // Ruta previa del repo
    { source: "/noticias", destination: "/blog", statusCode: 301 },
    { source: "/noticias/:path*", destination: "/blog/:path*", statusCode: 301 },
    { source: "/:locale(es|en)/noticias", destination: "/:locale/blog", statusCode: 301 },
    { source: "/:locale(es|en)/noticias/:path*", destination: "/:locale/blog/:path*", statusCode: 301 },
  ];
}
```

Las variantes sin prefijo caen después en el middleware de next-intl, que les
añade el locale detectado.

**Messages**: namespace `news` → `blog` con los textos reales de Webflow
(heading, lead rich, metaTitle, metaDescription, empty, error). Se elimina la
key muerta `home.viewNews`.

**SEO**:

- `generateMetadata` en índice (title "Blog | Ánima Village" + description) y
  detalle (title del post, description desde excerpt con fallback, OG image =
  featured image, `alternates.canonical` + `languages`).
- `metadataBase` (nuevo env `NEXT_PUBLIC_SITE_URL`, fallback
  `https://www.animavillage.com`) en `src/app/[locale]/layout.tsx` para que las
  OG images relativas/absolutas resuelvan bien.
- JSON-LD: `Article` en el detalle (headline, datePublished, dateModified,
  image, publisher Organization "Ánima Village", inLanguage); `Blog` +
  `BreadcrumbList` en el índice.
- `src/app/sitemap.ts` nuevo: rutas estáticas (`/`, `/about`, `/brands`,
  `/agenda`, `/blog`) × locales + `/blog/[slug]` desde `NEWS_SLUGS_QUERY`, con
  `alternates.languages` (hreflang es/en). Excluye `/coming-soon`.

### API Changes

Ninguna hacia fuera. Interno: firma de `fetchGraphQL` gana `tags?` opcional.

## Risk Assessment

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Slugs ES/EN divergen en WP Multilang (cambio de idioma en el detalle rompe) | Media | Medio | WP Multilang comparte el post (mismo slug); verificar en dev con un post real antes de cerrar Fase 3. |
| Redirect 301 se cachea mal durante pruebas en prod | Baja | Medio | Probar primero en preview de Vercel con `curl -I`; 301 solo llega a prod tras validar. |
| `export const revalidate` + POST fetch deja página en blanco si WP cae en build/ISR | Baja | Medio | Páginas ya son null-safe (try/catch + estado `failed`); ISR conserva el último cache bueno ante revalidación fallida (por eso `revalidate` y no `force-static`). |
| Excerpt vacío en WP → meta description vacía | Media | Bajo | Fallback a `blog.metaDescription` del namespace. |
| Hover de card no coincide con Webflow (transición `height .2s` ambigua en CSS minificado) | Media | Bajo | Comparar contra el sitio vivo al implementar; es un detalle aislado en Tailwind. |
| Trabajo de Brands sin commitear se mezcla en los commits de fases | Alta | Medio | Commitear/mergear Brands ANTES de iniciar Fase 1 (ver Dependencies). `git add` selectivo por fase. |

## Phase Breakdown

### Phase 1: Rename `/noticias` → `/blog` + redirects 301
**Objetivo**: la ruta nueva funciona con el contenido actual; URLs viejas redirigen.

- [ ] `git mv src/app/[locale]/(site)/noticias src/app/[locale]/(site)/blog`
- [ ] Actualizar hrefs internos: `blog/page.tsx` (`/blog/${slug}`), `blog/[slug]/page.tsx`
- [ ] `SiteHeader.tsx` y `SiteFooter.tsx`: `href: "/blog"` (+ comentarios)
- [ ] `messages/{en,es}.json`: namespace `news` → `blog` (mismos textos por ahora); borrar `home.viewNews`
- [ ] `next.config.ts`: bloque `redirects()` completo (ver arriba)
- [ ] Test de redirects (importar `next.config` y asegurar los 8 entries con `statusCode: 301`)

**Validación**: `npm test` + `npm run typecheck` + `npm run lint` verdes;
`curl -I localhost:3000/news` → 301 → `/blog` → 307 (intl) → `/es/blog` 200;
`/es/noticias` → 301 `/es/blog`.

### Phase 2: Índice `/blog` con diseño Webflow
**Objetivo**: paridad visual del listado.

- [ ] `fetchGraphQL`: soporte `tags` + tests en `wp.test.ts`
- [ ] `formatMonthYear()` en `src/lib/utils.ts` + tests (es/en, capitalización, UTC)
- [ ] BEM `.blog-intro` en `globals.css` (bg claro, 300 px, breakpoints 991/767)
- [ ] `BlogIntro.tsx` (t.rich con `em`/`br`)
- [ ] `BlogList.tsx` (Tailwind: grid, card 2/3 + overlay + texto; `next/image` fill + `sizes` + `shouldBypassImageOptimizer`)
- [ ] `blog/page.tsx`: componer Intro + List, `export const revalidate = 3600`, fetch con tags
- [ ] Messages: textos Webflow EN/ES del intro
- [ ] Comparación visual desktop/mobile vs `animavillage.com/news`

**Validación**: suite verde; preview visual (3 cols desktop, 1 col mobile,
overlay/typo correctos, fechas "Mayo 2026"/"May 2026").

### Phase 3: Detalle `/blog/[slug]`
**Objetivo**: paridad visual del post.

- [ ] `NEWS_BY_SLUG_QUERY` + `excerpt`/`modified`; `PostSingle` en types
- [ ] BEM `.blog-post-hero` + `.blog-post__content` (tipografía editorial WP) en `globals.css`
- [ ] `BlogPostHeader.tsx`; reescribir `blog/[slug]/page.tsx` (sin back-link, `export const revalidate = 3600`, tags por slug)
- [ ] `notFound()` intacto para slugs inexistentes

**Validación**: suite verde; post real renderiza título/fecha/imagen/cuerpo con
paridad; 404 correcto; cambio de locale mantiene el slug.

### Phase 4: SEO — metadata, JSON-LD, sitemap
**Objetivo**: cierre SEO del cutover.

- [ ] `NEXT_PUBLIC_SITE_URL` (`.env.example`, `.env.local`) + `metadataBase` en `[locale]/layout.tsx`
- [ ] `generateMetadata` en índice y detalle (OG completo, canonical, hreflang)
- [ ] `JsonLd.tsx` + `Article` (detalle) y `Blog`/`BreadcrumbList` (índice)
- [ ] `NEWS_SLUGS_QUERY` + `src/app/sitemap.ts` (estáticas × locale + posts, hreflang)

**Validación**: `curl localhost:3000/sitemap.xml` bien formado; OG/JSON-LD
visibles en el HTML fuente; validador de schema.org sin errores.

### Phase 5: Documentación final
**Objetivo**: cerrar según workflow.

- [ ] `docs/blog.md` (arquitectura de la sección, decisiones de cache/SEO)
- [ ] Actualizar el ejemplo del hybrid rule en `CLAUDE.md` (añadir Blog junto a Brands)
- [ ] Borrar `docs/blog-migration-plan.md`

**Validación**: docs consistentes; suite verde.

## Testing Strategy

### Unit Tests (vitest, patrón de `wp.test.ts`)
- `formatMonthYear`: es/en, capitalización ES ("Mayo 2026"), UTC, fecha inválida.
- `fetchGraphQL` con `tags`: se propagan a `next.tags`; sin tags no rompe llamadores actuales.
- `next.config` redirects: 8 entries, `statusCode: 301`, destinos correctos.

### Integration / Manual
- Redirects encadenados con coming-soon activado y desactivado.
- `/es/blog` y `/en/blog` con WP local (contenido por idioma vía `?lang=`).
- Slug inexistente → 404. WP caído → estado de error del índice.
- Paridad visual (desktop 1280, tablet 768, mobile 375) vs Webflow.

## Rollback Plan

Un commit por fase → `git revert` selectivo. Los redirects son aditivos
(quitarlos restaura el comportamiento previo sin tocar rutas). El rename de
Fase 1 se revierte con el commit correspondiente. Nada toca WP.

## Dependencies

- **Bloqueante**: el trabajo de Brands en el working tree está sin commitear
  (rename `marcas→brands`, componentes nuevos, globals.css, messages). Debe
  commitearse/mergearse antes de la Fase 1 para no mezclar diffs.
- LocalWP `anima-headless.local` corriendo para dev/manual QA; posts con
  traducción ES/EN en WP Multilang.
- `WORDPRESS_API_URL` y `NEXT_PUBLIC_SITE_URL` configurados en Vercel (prod/preview).
- El 301 de `/news` solo surte efecto SEO cuando `www.animavillage.com` apunte
  al proyecto de Vercel (cutover DNS, fuera de alcance de este plan).
- Sin ticket Jira asignado: los commits usan el placeholder `WEB-000` (convención
  ya presente en el historial).
