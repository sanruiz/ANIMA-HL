# Brand Detail Page (`/brands/[slug]`)

Interna de marca migrada de Webflow (`animavillage.com/brands/[slug]`),
enlazada desde las tarjetas del directorio en `/brands`.

## Arquitectura

- **Datos**: `BRAND_BY_SLUG_QUERY` (`src/lib/queries.ts`) — WPGraphQL
  `brand(id: $slug, idType: SLUG)`. Trae `content` (post body de WP, es la
  descripción de la marca, **no** un campo ACF), `featuredImage`,
  `brandTags`, y `brandFields: brands { store, phone, days, time }`.
  `BRAND_SLUGS_QUERY` alimenta el sitemap.
- **Tipos**: `BrandSingle`, `BrandBySlugResponse`, `BrandSlugNode`,
  `BrandSlugsResponse` en `src/lib/types.ts`.
- **UI**: `BrandDetail.tsx` (BEM `.brand-detail*` en `globals.css`) — título,
  descripción condicional, filas de info condicionales (Hours/Contact/
  Location vía `brands.detail.*` en los mensajes), una sola imagen a full
  height (ver decisión de diseño abajo).
- **Ruta**: `src/app/[locale]/(site)/brands/[slug]/page.tsx` —
  `export const revalidate = 3600` + `tags: ["wp:brands", "wp:brand:${slug}"]`
  (mismo criterio que `/blog/[slug]`: sin webhook de revalidación todavía).
  `notFound()` para slugs inexistentes. `generateMetadata` + JSON-LD
  (`Store` + `BreadcrumbList`).
- **Sitemap**: `getBrandEntries()` en `src/app/sitemap.ts`, mismo patrón que
  `getPostEntries()`.

## Decisiones de diseño (paridad verificada contra Webflow)

Verificado con `curl` sobre 8 marcas reales en producción (`nike`,
`birkenstock`, `columbia`, `lululemon`, `mac-store`, `sephora`,
`sunglass-hut`, más `nike` en `/es/`):

- **Una sola imagen, no una galería.** El repeater `gallery` de Webflow
  está vacío en las 8 marcas muestreadas y siempre cae al fallback de una
  imagen (la featured image del CPT). `BrandFields.gallery` se sigue
  consultando en `BRANDS_QUERY` del listado, pero no se usa en la interna.
- **`website`, `petfriendly`, `petfriendlyDescription` no se muestran.**
  Existen como datos en WP (y hay keys de traducción sin usar,
  `brands.website` / `brands.petFriendly`) pero el diseño vigente en
  Webflow no los renderiza. Si el negocio decide activarlos, la data ya
  está disponible en `brandFields`.
- **"Hours" = `${days}: ${time}`** (`formatBrandHours()` en `utils.ts`).
  WP guarda ambos campos por separado.
- **Etiquetas traducidas correctamente** (Horario/Contacto/Ubicación) —
  Webflow tiene un bug de contenido donde la versión `/es/` muestra
  "Hours"/"Location" en inglés (son un HTML embed con texto fijo, no
  next-intl). Se corrige deliberadamente en la migración.
- **Sección "You may also like" no implementada.** Tiene
  `w-condition-invisible` en Webflow y está vacía en las 8 marcas
  verificadas.

## Áreas para revisar con contenido real de producción

- `days`/`time` no estaban localizados en los datos de prueba de WP local
  (mismo valor en `?lang=es` y `?lang=en`). Si en producción usan el mismo
  formato `[:en]..[:es]..[:]"` que los `brandTags`, envolver con
  `localizeTags()` de `src/lib/i18n-tags.ts`.
