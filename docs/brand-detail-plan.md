# Brand Detail Page (`/brands/[slug]`) Implementation Plan

Migrar la **interna de marca** de Webflow (`animavillage.com/brands/[slug]`) a
Next.js, siguiendo el split híbrido BEM/Tailwind ya usado en Brands y Blog.

## Problem Statement

- `/brands` (listado) ya está migrado: `BrandsHero` + `BrandsIntro` +
  `BrandsDirectory` (grid con filtros por tag). Las tarjetas **no son
  clicables** — no existe ruta de detalle.
- `BrandFields` (`src/lib/types.ts`) ya expone `store`, `phone`, `website`,
  `days`, `time`, `petfriendly`, `petfriendlyDescription`, `gallery` vía
  `BRANDS_QUERY`, pero ningún componente los renderiza todavía.
- Objetivo: página `/brands/[slug]` con paridad visual 1:1 contra la interna
  real de Webflow, y tarjetas del directorio enlazando a ella.

## Design Verification (contra producción, no memoria del modelo)

Verificado con `curl` sobre 8 marcas reales (`nike`, `birkenstock`,
`columbia`, `lululemon`, `mac-store`, `sephora`, `sunglass-hut`, `nike` en
`/es/`) + CSS compartido de Webflow
(`anima-village.webflow.shared.fb0fd05bc.min.css`) + introspección del schema
WPGraphQL local (`brand(id, idType: SLUG)`, tipo `Brand`, campo `content`).

**Estructura** (`section.inset > .template-info-container`, único bloque de
contenido — no hay hero ni intro propios de la interna):

- Grid 2 columnas (`grid-template: ".Area"/1fr 1fr`, gap 50px, 95% ancho, max
  1440px, `max-height: 75vh`) → 1 columna ≤991px (`max-height: none`, imagen
  **primero** vía `order: -1`, `aspect-ratio: 16/9`).
- **Columna texto** (`.brand-text-wrapper`, flex column):
  1. `.brand-title` — Cardo (fuente body por defecto, no itálica), 36/48px.
  2. `.p1.brand` — descripción, **condicional** (Webflow la oculta cuando
     está vacía). Es el campo `content` del post de WP (`<p>` con `<br/>`),
     no un campo ACF — confirmado con `content` en el tipo `Brand` de
     WPGraphQL.
  3. Bloques `.brand-info-code` repetidos (label `.brand-subtitle` color rosa
     `#b59289` + valor `.brand-info-link`/`.brand-info`), cada uno
     condicional si el dato no existe:
     - **Hours**: `${days}: ${time}` (ej. "Monday to Sunday: 11:00 AM – 8:00
       PM"). Un solo string armado en el cliente — WP guarda `days`/`time`
       por separado.
     - **Contact**: teléfono como `tel:` link (oculto si `phone` vacío —
       verificado en `lululemon`, `mac-store`, `sunglass-hut`).
     - **Location**: texto plano (`store`).
- **Columna imagen**: el repeater `gallery` de Webflow está **vacío en las 8
  marcas verificadas** (`w-dyn-items w-dyn-hide` sin items) y siempre cae al
  fallback `.brand-img-main` de una sola imagen — que es la featured image
  del CPT. Es decir: **una sola imagen**, no un grid de galería, pese a que
  `BrandFields.gallery` ya se consulta en `BRANDS_QUERY`.
- `section.related-brands` ("You may also like") tiene
  `w-condition-invisible` y está vacía en las 8 marcas — **no se implementa**
  (ver Risk Assessment).

**Campos con dato pero SIN uso visual en la interna actual** (verificado
empíricamente, no es un olvido de este plan): `website`, `petfriendly`,
`petfriendlyDescription`, `gallery` (como grid). `messages/{en,es}.json` ya
tiene keys `brands.website` / `brands.petFriendly` sin usar — se quedan sin
usar; añadirlos sería divergir del diseño vigente en Webflow, que es
exactamente lo que el usuario pidió replicar.

**Bug de contenido detectado en Webflow (no replicar)**: la versión `/es/`
de Nike muestra las etiquetas "Hours" y "Location" en inglés (solo
"Contacto" está traducido) porque son parte de un HTML embed con texto
fijo, no de next-intl. En Next.js las tres etiquetas van por
`useTranslations` correctamente traducidas (Horario/Contacto/Ubicación) —
mejora deliberada, no divergencia de diseño visual.

## Proposed Changes

### Data layer

- `src/lib/queries.ts`: `BRAND_BY_SLUG_QUERY` (`brand(id: $slug, idType:
  SLUG)`) con `id, title, slug, content, modified, featuredImage, brandTags,
  brandFields: brands { store, phone, days, time }`. `BRAND_SLUGS_QUERY`
  ligera (`slug`, `modified`) para el sitemap, igual patrón que
  `NEWS_SLUGS_QUERY`.
- `src/lib/types.ts`: `BrandSingle` (como `PostSingle` pero con
  `brandFields`/`brandTags`), `BrandBySlugResponse`, `BrandSlugNode`,
  `BrandSlugsResponse`.
- `src/lib/utils.ts`: `formatBrandHours(days, time)` → `"${days}: ${time}"`
  o `""` si falta cualquiera de los dos. Con test unitario (mirroring
  `formatMonthYear`).

### UI

- `BrandDetail.tsx` (PascalCase plano en `src/components/`, mismo patrón
  deliberado que el resto de Brands/Blog): BEM canvas — título, descripción
  (`dangerouslySetInnerHTML` del `content` de WP, igual que
  `blog-post__content` pero sin tipografía editorial completa: solo párrafo
  + `<br/>`/`<em>`), info rows condicionales, imagen única con
  `next/image` + `shouldBypassImageOptimizer`.
- `globals.css`: nuevo bloque BEM `BRAND DETAIL` — `.brand-detail`,
  `.brand-detail__grid`, `.brand-detail__media`, `.brand-detail__body`,
  `.brand-detail__title`, `.brand-detail__description`,
  `.brand-detail__info`, `.brand-detail__info-label`,
  `.brand-detail__info-value`, espejo de
  `template-info-container`/`brand-text-wrapper`/`brand-title`/`p1.brand`/
  `brand-info-code`/`brand-subtitle`/`brand-info-link`. Breakpoint único
  ≤991px (stack + imagen primero + `aspect-ratio: 16/9`). Nuevo token
  `--color-rosa: #b59289` en `:root` (color label, no existía).
- `BrandsDirectory.tsx`: envolver cada `<li>` en `Link` (`@/i18n/navigation`)
  a `/brands/${brand.slug}`, mismo patrón que `BlogList.tsx`.
- `src/app/[locale]/(site)/brands/[slug]/page.tsx`: fetch por slug,
  `notFound()` si no existe, `export const revalidate = 3600` +
  `tags: ["wp:brands", "wp:brand:${slug}"]` (mismo criterio que blog: sin
  webhook de revalidación todavía, 1h en vez de los 30d por defecto de
  `caching.instructions.md`).

### SEO

- `generateMetadata`: title `${brand.title} | Ánima Village`, description =
  `stripHtml(content)` con fallback a `brands.metaDescription`, OG image =
  featured image, `alternates.canonical` + `languages`.
- `JsonLd`: `Store` (schema.org) con `name`, `image`, `telephone` si existe,
  `openingHours`-like en texto libre (no vale la pena parsear a formato ISO
  de horarios para un solo string de WP) + `BreadcrumbList` (Home → Brands →
  marca), mismo patrón que el detalle de blog.
- `src/app/sitemap.ts`: nueva sección `getBrandEntries()` con
  `BRAND_SLUGS_QUERY`, igual que `getPostEntries()`.

## Risk Assessment

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| `related-brands` vacío en las 8 marcas de muestra puede tener contenido en otras marcas no muestreadas | Baja | Bajo | Sección con `w-condition-invisible`: aunque tuviera datos, Webflow la esconde. No se implementa; si el negocio la activa en Webflow habrá que revisar de nuevo. |
| `days`/`time` no localizados en WP local (mismo valor en `?lang=es` y `?lang=en` en los datos de prueba) | Media | Medio | `formatBrandHours` es agnóstico al idioma (solo concatena); si producción trae los campos en formato `[:en]..[:es]..[:]"` como los tags, envolver con `localizeTags()` — dejar el hook listo pero no forzar sin evidencia. |
| Contenido `content` del brand trae HTML no confiable | Baja | Bajo | Mismo patrón que `blog-post__content`: viene de editores de WP, no de usuarios finales. |
| Slug no coincide entre locales (WP Multilang) | Baja | Medio | Mismo slug verificado en vivo para `nike` (en/es). Igual que blog, WP Multilang comparte el post. |

## Phase Breakdown

### Phase 1: Data layer
- [ ] `BRAND_BY_SLUG_QUERY` + `BRAND_SLUGS_QUERY` en `queries.ts`
- [ ] `BrandSingle`, `BrandBySlugResponse`, `BrandSlugNode`, `BrandSlugsResponse` en `types.ts`
- [ ] `formatBrandHours()` en `utils.ts` + test

**Validación**: `npm test` verde.

### Phase 2: UI
- [ ] Bloque BEM `.brand-detail*` + `--color-rosa` en `globals.css`
- [ ] `BrandDetail.tsx`
- [ ] `src/app/[locale]/(site)/brands/[slug]/page.tsx` (fetch, `notFound()`, revalidate/tags)
- [ ] `BrandsDirectory.tsx`: cards como `Link`

**Validación**: `npm run dev`, comparar visual desktop/mobile contra
`animavillage.com/brands/nike` (y una marca sin teléfono/descripción, ej.
`lululemon`, para el caso condicional).

### Phase 3: SEO
- [ ] `generateMetadata` (title/description/OG/canonical/hreflang)
- [ ] `JsonLd` (`Store` + `BreadcrumbList`)
- [ ] `sitemap.ts`: `getBrandEntries()`

**Validación**: `npm run typecheck` + `npm run lint` verdes; `curl
localhost:3000/sitemap.xml` incluye slugs de marca.

### Phase 4: Documentación final
- [ ] `docs/brand-detail.md`
- [ ] Borrar `docs/brand-detail-plan.md`

## Testing Strategy

- Unit: `formatBrandHours` (ambos campos, uno vacío, ambos vacíos).
- Manual: marca con todos los campos (`nike`), marca sin teléfono
  (`lululemon`), marca sin descripción (`birkenstock`), slug inexistente →
  404, cambio de locale mantiene el slug.

## Rollback Plan

Un commit por fase → `git revert` selectivo. La ruta es aditiva (no toca
`/brands` existente salvo el `Link` en las cards).

## Dependencies

Ninguna bloqueante. `anima-headless.local` corriendo para dev/QA.
