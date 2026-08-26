# Plan: Páginas internas de Arte (Espacio Abierto / Programa Público / Colección)

## Problema y objetivo

Hoy `/arte` apila 5 secciones en una sola página larga (`ArteHero`, `ArteAbout`,
`ArteOpenSpace`, `ArtePublicProgram`, `ArteCollection`). Las tres últimas son
splits texto+imagen (una sola imagen cada una). Queremos:

1. Colapsar esas tres secciones en **una sola sección de overview** con 3
   tarjetas (imagen + label: "Espacio Abierto", "Programa Público",
   "Colección de Arte") que enlazan a páginas internas.
2. Crear **3 páginas de detalle** (`/arte/espacio-abierto`,
   `/arte/programa-publico`, `/arte/coleccion`) con un layout de dos columnas
   (texto a la izquierda, galería de imágenes a la derecha), replicando el
   patrón ya usado en `brand-detail` / `event-detail`.

## Decisiones ya confirmadas

- **Contenido**: hardcodeado vía `next-intl` + imágenes estáticas en `/public`,
  igual que hoy. No se crea CPT/ACF nuevo en WordPress.
- **Routing**: 3 rutas estáticas dedicadas, cada una con su propio `page.tsx`
  (no `[slug]` dinámico, porque cada sección tiene forma de contenido distinta:
  Programa Público lleva CTA a `/agenda`, Colección lleva eyebrow, etc.).
- **Galería**: grid fija de 4 imágenes (2x2), igual que el mockup.
- **ArteHero y ArteAbout**: se mantienen sin cambios; solo se reemplazan
  `ArteOpenSpace` + `ArtePublicProgram` + `ArteCollection`.
- **Styling**: todo lo nuevo (tarjetas de overview + layout de detalle) se
  construye en **Tailwind**, no BEM/`globals.css`. `ArteHero`/`ArteAbout` no se
  tocan y se quedan en BEM tal cual están. Ver sección de Styling más abajo.

## Arquitectura propuesta

### 1. Overview (`/arte/page.tsx`)

- Se mantiene: `ArteHero`, `ArteAbout`.
- Se elimina: `ArteOpenSpace`, `ArtePublicProgram`, `ArteCollection`.
- Se agrega: un nuevo componente `src/components/arte-sections/index.tsx`
  (domain-folder + `index.tsx`, kebab-case, según convención del proyecto) que
  renderiza las 3 tarjetas (imagen + label) enlazando con `next-intl`'s
  `Link` a `/arte/espacio-abierto`, `/arte/programa-publico`, `/arte/coleccion`.
- **Tailwind puro**: `grid grid-cols-1 md:grid-cols-3 gap-*`, tokens semánticos
  (`bg-brand-oscuro`, `text-brand-beige`), `cn()` de `@/lib/utils`. Es una lista
  de N items repetidos → encaja con la regla híbrida del proyecto (Tailwind
  para todo lo interactivo/repetido dentro de un canvas BEM). Sin CSS nuevo en
  `globals.css`.

### 2. Componente de detalle compartido

- `src/components/arte-detail/index.tsx` — layout de dos columnas reutilizable
  por las 3 páginas, mismo layout conceptual que `brand-detail`/`event-detail`
  (contenido a la izquierda, imagen/galería a la derecha) pero **implementado
  en Tailwind** en vez de extender sus clases BEM:
  - Columna izquierda: eyebrow opcional, título, artista/ficha técnica,
    descripción (rich text), CTA opcional (ej. "Ver agenda", con el
    `Button`/`Link` de shadcn si aplica).
  - Columna derecha: grid fija 2x2 de 4 imágenes (`next/image`), Tailwind
    (`grid grid-cols-2 gap-*`).
- Sin clases nuevas en `globals.css`. Tokens semánticos + `cn()` para
  variantes (ej. fondo verde/beige/claro según página, que hoy son
  `arte-split--verde/--beige/--claro`).
- Recibe props tipadas (`heading`, `eyebrow?`, `description`, `images: {src,
  alt}[4]`, `cta?: {href,label}`, `tone?: "verde"|"beige"|"claro"`), sin
  fetch — cada `page.tsx` le pasa el contenido leído de `next-intl`.

### 3. Tres páginas nuevas

- `src/app/[locale]/(site)/arte/espacio-abierto/page.tsx`
- `src/app/[locale]/(site)/arte/programa-publico/page.tsx`
- `src/app/[locale]/(site)/arte/coleccion/page.tsx`

Cada una: `generateMetadata` (título/descripción vía i18n, igual que hoy en
`/arte`), `setRequestLocale`, JSON-LD `BreadcrumbList` (mismo patrón que
brand/event) y render de `ArteDetail` con sus props.

### 4. i18n

Reestructurar el namespace `arte` en `messages/es.json` / `en.json`:
mover `openSpace*`, `program*`, `collection*` a sub-objetos
`arte.detail.openSpace`, `arte.detail.program`, `arte.detail.collection`
(mismo patrón que `brands.detail`), agregando `title`/`metaDescription`
propios por página y 4 `imageAlt` por galería en vez de 1.

### 5. Assets de imagen — bloqueante

Hoy solo existe **1 imagen por sección** en `/public/art`
(`open-space.jpg`, `public-program.jpg`,
`696ff8e4...VirroyLola_0011.avif`). El mockup muestra 4 fotos reales
distintas por sección (12 en total). **Necesito que me compartas esos 12
assets** (o me digas si reutilizamos temporalmente las imágenes actuales
duplicadas/recortadas como placeholder hasta tener las definitivas).

## Fases de implementación

1. **Plan** (este doc). ✅
2. **Componente compartido `arte-detail`** (Tailwind, sin CSS nuevo en
   `globals.css`). ✅
3. **3 páginas nuevas** (`espacio-abierto`, `programa-publico`, `coleccion`)
   con contenido placeholder/dummy + i18n reestructurado (`arte.sections`,
   `arte.detail.*`) + JSON-LD breadcrumb. ✅
4. **Overview** — nuevo `arte-sections` (Tailwind) reemplazando
   `ArteOpenSpace`/`ArtePublicProgram`/`ArteCollection` en `/arte/page.tsx`;
   componentes viejos borrados, CSS BEM muerto (`.arte-split*`,
   mobile overrides asociados) limpiado de `globals.css`. ✅
5. **QA manual** — probado en navegador (`typecheck`, `lint`, `vitest` en
   verde; capturas desktop/mobile es/en vía Chrome headless). Se detectó y
   corrigió un bug de contraste: el `h1` global (`globals.css`) fuerza
   `color: var(--color-warm-gray)`, que quedaba casi ilegible sobre fondo
   beige — se agregó color de tono explícito en `ArteDetail`. ✅
6. **Pendiente**: reemplazar imágenes placeholder (hoy la misma imagen
   original x4 por página) por los 12 assets reales en `/public/art/` y el
   copy dummy por el texto definitivo, ambos a entregar por el usuario
   durante QA. Después de eso: docs finales y borrar este plan.

Nada de esto se ha commiteado todavía — solo está en el working tree.

## Preguntas abiertas / riesgos

- Confirmar los 12 assets de imagen (bloqueante para QA visual real).
- Confirmar textos exactos por pieza si difieren del mockup (fechas de
  exhibición, ficha técnica, etc.) — actualmente solo tengo el texto visible
  en las capturas compartidas.
- Confirmar slugs exactos: `espacio-abierto` / `programa-publico` / `coleccion`
  (kebab-case sin acentos, consistente con el resto del sitio).
