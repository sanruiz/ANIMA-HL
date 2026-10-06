# Adoptar el core de `sanruiz-mall-frontend-starter` en ANIMA

Plan de migración para que ANIMA y Antara compartan el mismo core de Next.js,
como paso previo a empaquetarlo (`@sanruiz/mall-frontend-core`).

---

## Veredicto

**Sí, se puede — y es mucho menos trabajo del que parece.** El core ya es
prácticamente el mismo código en los dos repos: ANIMA fue el origen del starter
(está documentado en `REPLICABLE-MALLS-PLATFORM-OUTLINE.md` §5.3), así que la
"migración" es sobre todo **reconciliar una bifurcación**, no reescribir.

Medido archivo por archivo, los módulos de core difieren así:

| Archivo | Líneas que difieren ANIMA ↔ core |
|---|---|
| `src/lib/revalidation.ts` | 0 — idéntico |
| `src/lib/event-date-formatter.ts` | 2 (comentarios) |
| `src/app/assets/[...path]/route.ts` | 2 (comentarios) |
| `src/i18n/navigation.ts` | 2 (comentarios) |
| `src/lib/i18n-tags.ts` | sólo comentarios ES→EN |
| `src/lib/utils.ts` | core añade `isPetFriendly()` |
| `src/lib/wp.ts` | comentarios + endpoint por defecto |
| `src/lib/types.ts` / `queries.ts` | core es superconjunto |

No hay un solo conflicto de arquitectura. Lo que hay son **tres divergencias de
contrato que reconciliar** y **dos decisiones tuyas**.

---

## 1. El backend de ANIMA ya habla el contrato nuevo ✅

Esto era lo que condicionaba todo el plan. Verificado por introspección contra
`https://backend.animavillage.com/graphql`:

```
allSettings brand brandTag brandTags brands … deal dealTag dealTags deals …
event eventTags events … jobOffer jobOffers … mallSettings menu menuItem
menuItems menus … page pages post posts …
```

Y corriendo las queries reales del core contra producción:

| Query del core | Resultado en ANIMA |
|---|---|
| `EVENTS_QUERY` (con `gallery`, `place`, `featured`) | ✅ datos reales |
| `BRANDS_QUERY` con `after:` + `gallery` | ✅ datos reales |
| `MALL_SETTINGS_QUERY` | ✅ resuelve — campos en `null` |
| `MENUS_QUERY` (PRIMARY/FOOTER) | ✅ resuelve — `nodes: []` |
| `deals` / `jobOffers` | ✅ resuelven — vacíos |
| `posts` / `pages` | ✅ datos reales |

**El schema está completo; lo que falta es contenido.** `mallSettings` sin
capturar y los menús sin asignar a sus ubicaciones son trabajo de wp-admin, no
de código — pero hay que hacerlo antes de que `SiteNav` y el footer del core
tengan algo que renderizar (Fase 0).

Lo que **no** hace falta es migrar el plugin de WordPress antes de empezar: el
contrato de GraphQL ya está servido. La Fase 1 del outline (WP core portable)
no bloquea esta migración.

---

## 2. Corrección importante: el core se toma de `main`, no de `antara`

Me pediste "la rama antara", pero `antara` tiene **valores propios de Antara
metidos dentro de archivos de core**, que es justo lo que no queremos arrastrar:

```diff
# src/lib/seo.ts en la rama antara
-const DEFAULT_SITE_URL = "https://your-mall.example.com";   # main (genérico)
+const DEFAULT_SITE_URL = "https://antara-home.sanruiz.co";  # antara (específico)

# src/i18n/routing.ts en la rama antara
+  localePrefix: "as-needed",   # cambia TODAS las URLs del sitio
```

`main` ya absorbió el trabajo de core que nació en `antara` (`73ee3d1` menús WP
+ helpers de nav/carousel, `b911d30` newsletter Doppler, `8de3757`
LocaleSwitcher) y además tiene `91936d8` (`isPetFriendly`), que `antara` no
tiene.

> **Regla para el futuro paquete:** si un archivo de core contiene el nombre,
> dominio o token de un mall concreto, ya no es core. `main` pasa esa prueba;
> `antara` no.

### 2.1 Pero `main` no gana en todo — hunks a rescatar de `antara`

`main` y `antara` están bifurcadas en ambas direcciones. En estos archivos
—que existen en las dos ramas— **`antara` está adelante y hay que traer el
cambio**:

| Archivo | Qué tiene `antara` que `main` no | ¿Por qué es core? |
|---|---|---|
| `src/lib/menus.ts` | `toHref(node, locale)` quita el prefijo de idioma que mete WP Multilang (`/en/conocenos/`) antes de pasárselo al `<Link>` locale-aware | 🔴 **ANIMA es WP Multilang.** Sin esto los menús en inglés quedan con doble prefijo `/en/en/...` |
| `src/lib/wp-image.ts` | `getWpImageSrc()` — rutea uploads de `.local` por `/assets` | Permite probar desde otro equipo de la LAN sin DNS local |
| `src/lib/types.ts` | `petfriendly: string[] \| …` (el tipo correcto) | `main` añadió `isPetFriendly()` pero **no corrigió el tipo** |
| `src/lib/queries.ts` | Paginación en `BRANDS_QUERY` (`after:`/`pageInfo`) y campos extra en deals | ANIMA tiene 42 marcas y `first: 100` le alcanza hoy (`hasNextPage: false`). Antara sí la necesita; ANIMA la hereda gratis y deja de tener un techo silencioso |

### 2.2 Y un caso donde `main` gana a propósito

`src/app/api/revalidate/route.ts`: el diseño original (el que ANIMA corre hoy
en producción) acepta el secreto **sólo por header**, y lo dice en el propio
archivo —

> *"Auth is a shared secret in a header rather than a query string, so the value
> does not end up in access logs or the Vercel dashboard URL list."*

`antara` añadió después un `GET` con `?secret=...` (`4258429`) en contra de ese
comentario. Aquí lo nuevo es peor: **tomar el de `main`**, que es
byte-equivalente al de ANIMA (difieren 2 líneas de comentario) y no cambia nada
operativo.

### 2.3 Core genuino que sólo existe en `antara` (archivos nuevos)

- `src/lib/event-calendar.ts` + `src/app/api/events/[slug]/calendar/route.ts` (ICS)
- `src/lib/brands.ts` (fetch paginado de marcas)
- `src/lib/server-utils.ts`
- `src/components/site/breadcrumbs.tsx`
- `src/lib/menus.test.ts`, `src/lib/seo.test.ts`

### 2.4 Lo que NO se trae de `antara`

- `src/components/antara/*` — identidad visual de Antara
- `src/lib/pet-friendly/*`, `(site)/pet-friendly/*`, `(site)/mi-cuenta/*` —
  producto aparte (`sanruiz-mall-pet-friendly`)
- `src/lib/brand-category-colors.ts` — tokens de diseño de Antara
- Las divergencias de `seo.ts` y `routing.ts` de §2

---

## 3. Riesgos reales encontrados

### 🟠 A. El fix de CONSENT de Doppler se perdería

`lib/newsletter/doppler.ts` del core **no envía `CONSENT = true`**. ANIMA sí
(`subscribe.ts:55`), por el fix de la semana pasada (`58ec2fc`, PR #26).
Adoptar el core tal cual **regresa ese fix** y los contactos nuevos quedan con
`CONSENT = false`, excluidos de campañas que filtran por consentimiento.

→ Re-aplicar el fix sobre el `doppler.ts` del core **y subirlo al starter**,
para que Antara también lo tenga.

### 🟠 B. `menus.ts` y el doble prefijo de idioma

Ver §2.1. Es el riesgo más fácil de pasar por alto, porque la regla "tomar
siempre de `main`" lo introduce silenciosamente y sólo se ve en inglés.

### 🟡 C. El tipo de `petfriendly` está mal en ANIMA

ANIMA declara `petfriendly: string | boolean | number | null`, pero el backend
devuelve un **array**: `"petfriendly": ["no"]`. Hoy no explota porque ANIMA
consulta el campo pero no lo renderiza. Se arregla con `isPetFriendly()` de
`main` + el tipo de `antara` (§2.1).

### 🟢 D. `PAST_EVENT_TAG_SLUG` — menor, no bloqueante

El core busca el término `past-events`; ANIMA usa `eventos-pasados`. El backend
de ANIMA tiene los dos (`past-events` con 0 eventos, `eventos-pasados` con 47).

**Medido contra producción, el impacto hoy es cero.** `isPastEvent()` es un OR:

```ts
return hasPastEventTag(event) || isPastByDate(event, todayKey);
```

Los 47 eventos etiquetados tienen **todos** fecha pasada, así que
`isPastByDate()` los clasifica bien aunque el slug de la etiqueta cambie. La
etiqueta es hoy un override manual redundante.

El riesgo es **a futuro**: un evento con fecha futura marcado a mano como
pasado dejaría de respetarse. Pequeño, pero conviene cerrarlo (D1).

Y hay una razón de fondo por la que la etiqueta está vacía: el cron que debería
escribirla está roto (§4).

### 🟢 E. `localePrefix` — sin riesgo al tomar `main`

Era el riesgo grande (reescribir todas las URLs de un sitio en producción) y
**desaparece al tomar `main` en vez de `antara`**: `main` mantiene el prefijo
siempre, igual que ANIMA hoy. `/es/brands` sigue siendo `/es/brands`. Cero
redirects 301, cero impacto SEO.

---

## 4. El backend ya corre `sanruiz-mall-core` (y tiene un bug)

Verificado por SSH (`wp plugin list`):

```
advanced-custom-fields-pro   active     6.8.4
sanruiz-mall-core            active     0.6.0      ← ya es el plugin de la plataforma
sanruiz-mall-pet-friendly    inactive   0.1.0      ← instalado, apagado
wp-graphql                   active     2.23.1
wpgraphql-acf                active     3.0.0
wp-multilang / -pro          active     2.4.33 / 1.21
```

**ANIMA ya está migrada del lado de WordPress.** `soma-malls-content-types` ya
no existe aquí — lo que queda desactualizado son nuestros propios documentos:
`.env.example` y `docs/HOME-EVENTS-LISTING-LOGIC.md` todavía lo nombran. Hay
que corregirlos (Fase 6).

### 🔴 Bug en `sanruiz-mall-core` 0.6.0 — el cron no etiqueta los eventos del año en curso

Esto explica por qué `past-events` tiene 0 eventos aunque el cron
`sanruiz_mall_core_update_content` corre **cada hora** (verificado con
`wp cron event list`).

`ContentUpdaterService::update_past_events()` compara así:

```php
$reference = $end_date ? $end_date : $start_date;   // ACF crudo: "20260828"
$today     = current_time( 'Y-m-d' );               // "2026-10-05"

if ( ! $reference || $reference >= $today ) {
    continue;                                        // ← entra siempre que el
                                                     //   evento sea del año en curso
}
```

ACF guarda la fecha como `Ymd` (`20260828`), pero la compara contra `Y-m-d`.
Como `"20260828"` es numérico y `"2026-10-05"` no, PHP 8 las compara **como
strings** — y ahí el año es lo único que se evalúa limpio: en el índice 4 queda
siempre dígito contra `'-'`, y en ASCII `'0'` (48) > `'-'` (45).

**El bug está acotado al año en curso.** Verificado en el PHP del servidor
(8.5.10), con `today = 2026-10-05`:

| `reference` | `>= $today` | Resultado |
|---|---|---|
| `20251231` (año anterior) | `false` | ✅ etiqueta bien |
| `20260105` (año en curso) | `true` | ❌ nunca etiqueta |
| `20260828` (año en curso) | `true` | ❌ nunca etiqueta |
| `20261231` (año en curso) | `true` | ❌ nunca etiqueta |
| `20270101` (año futuro) | `true` | ✅ salta bien |

Es decir: **todo evento del año en curso queda sin etiquetar, sea de enero o de
diciembre**; los de años anteriores sí se etiquetan. Los 47 eventos de ANIMA son
todos de 2026, lo que cuadra exacto con el contador en 0.

Efecto colateral que conviene mencionar en el reporte: el **1 de enero** todos
pasan a ser "año anterior" y el cron los etiqueta **de golpe**.

No es un problema de ANIMA: afecta a cualquier mall con fechas ACF en `Ymd`. La
copia local de Antara (`backend-antara`, plugin 0.5.0) tiene la misma
comparación en `ContentUpdaterService.php:199`, así que viene de antes de 0.6.0.

Corresponde arreglarlo en el repo del plugin, no aquí. Normalizar antes de
comparar (`date('Y-m-d', strtotime($reference))`) o comparar en `Ymd` de los
dos lados. `update_expired_deals()` usa `meta_query` con `type => DATE`, que
MySQL sí castea bien desde `Ymd` — ese no está afectado.

## 5. Decisiones que necesito de ti

### D1 — Eventos pasados

§4 confirma que el plugin instalado escribe `past-events`, así que migrar el
dato **no se revierte solo**. Pero también confirma que el cron que lo escribiría
está roto, y que la clasificación real la hace la fecha en el frontend.

| Opción | Qué implica |
|---|---|
| **a) Migrar el dato en WP** (recomendada) | Re-etiquetar los 47 eventos a `past-events` por wp-cli vía SSH y borrar `eventos-pasados`. El core queda intacto y ANIMA = Antara. Escribir multilang requiere wp-cli por SSH, no REST/GraphQL. |
| b) Hacer el slug configurable | `PAST_EVENT_TAG_SLUG` sale de env. No se toca el dato, pero el core gana una opción que existe sólo por deuda histórica de ANIMA. |
| c) No hacer nada por ahora | Defendible: §3D mide impacto cero hoy. Deja la deuda viva. |

En los tres casos conviene reportar el bug del cron (§4) al repo del plugin: es
independiente de esta migración y hoy afecta a los dos malls.

### D2 — Convención de componentes

- El `CLAUDE.md` de ANIMA exige `kebab-folder/index.tsx`.
- El core (y Antara) usan plano: `kebab-case.tsx`.
- ANIMA hoy tiene **31 archivos `PascalCase.tsx`** que ya violan su propia
  regla, más 11 carpetas kebab que sí la cumplen.

Hay que elegir una y actualizar `CLAUDE.md`. **Recomiendo la del core** (plano
kebab) para que "misma arquitectura" sea literal. **No propongo refactorizar
los 31 archivos en esta migración** — es ruido que oculta los cambios de core.
Tarea aparte.

---

## 6. Clasificación completa de archivos

### Core — se reemplaza (base `main`, con los hunks de §2.1)

```
src/lib/wp.ts                 src/lib/queries.ts         src/i18n/request.ts
src/lib/types.ts              src/lib/cache-tags.ts      src/i18n/routing.ts
src/lib/revalidation.ts       src/lib/i18n-tags.ts       src/i18n/navigation.ts
src/lib/wp-image.ts           src/lib/seo.ts             src/lib/utils.ts
src/lib/events.ts (ver D1)    src/lib/event-date-formatter.ts
src/lib/menus.ts              src/lib/use-mobile-menu.ts src/lib/use-scroll-carousel.ts
src/lib/newsletter/*          src/app/actions/subscribe.ts (+ fix CONSENT)
src/app/api/revalidate/route.ts   src/app/assets/[...path]/route.ts
src/components/ui/*           src/components/site/*
```

**Excepción: `src/components/site/site-nav.tsx` no es core.** Trae una lista de
rutas quemada (`/brands`, `/events`, `/deals`, `/jobs`, `/blog`) que es el nav
de ejemplo del starter. ANIMA conserva su `SiteHeader`; y una vez cargados los
menús en wp-admin (Fase 0) la navegación sale de WordPress. El resto de
`src/components/site/*` sí es genérico: `entity-card` recibe `href` por prop y
`nav-link` no asume ninguna ruta.

**Las rutas públicas son de cada mall.** Nada del core obliga a `/events`:
`/agenda` se queda como está. Cero redirects, cero impacto SEO — igual que con
`localePrefix` (§3E).

### Extensiones de ANIMA — se conservan, adaptadas al core nuevo

```
src/lib/coming-soon.ts + wrapper de proxy.ts    src/lib/redirects.ts
src/app/sitemap.ts, robots.ts, [locale]/layout.tsx y (site)/layout.tsx
  — enumeran rutas propias (/about, /gastronomy, /agenda, /map) y cablean
    el shell; son por mall, no core
src/lib/brand-taxonomy.ts                        src/app/actions/subscribe-state.ts
src/app/[locale]/(site)/{arte,about,map,gastronomy,agenda}/*
globals.css (3093 líneas BEM de Webflow)         31+11 componentes de marca
GA4 (@next/third-parties), Vercel Analytics, lottie-react, iconos de app
```

**`proxy.ts` es la prueba de fuego del split.** El coming-soon de ANIMA debe
**envolver** el `createMiddleware(routing)` del core, no forkearlo. Si se logra
sin tocar el archivo de core, el corte está bien hecho y el paquete va a
funcionar.

---

## 7. Fases

| Fase | Contenido | Commit |
|---|---|---|
| **0** | wp-admin: capturar `mallSettings`, asignar menús a PRIMARY/FOOTER. Resolver D1. Reportar el bug del cron (§4). | — (WP) |
| **1** | Subir `next` 16.2.9 → 16.3.8 + deps del core. `typecheck && test && build` verde. | `chore: align deps with mall core` |
| **2** | Reemplazar los archivos de core por los de `main` + hunks de §2.1. Re-aplicar fix CONSENT. ANIMA aún no usa lo nuevo. | `refactor: adopt mall-frontend-starter core` |
| **3** | Portar de `antara`: `event-calendar`, `brands.ts`, `server-utils`, `breadcrumbs`, tests. | `feat: port core modules from antara` |
| **4** | Adaptar las extensiones de ANIMA (`proxy.ts` como wrapper, `agenda/` sobre `events.ts`). | `refactor: rebuild ANIMA extensions on core` |
| **5** | Capa de tokens shadcn en `globals.css` **sin tocar** el BEM existente. | `feat: add shadcn token layer` |
| **6** | Docs: actualizar `CLAUDE.md` (D2), `README`, corregir las referencias a `soma-malls-content-types` en `.env.example` y `HOME-EVENTS-LISTING-LOGIC.md` (§4), borrar este plan. | `docs: document shared core` |

Verificación en cada fase: `npm run typecheck && npm run lint && npm test && npm run build`.

---

## 8. Hacia el paquete (fuera de alcance, pero lo condiciona)

Al terminar, ANIMA y Antara tendrán el mismo core en tres lugares (`main`,
`antara`, ANIMA). **Paso 0 del empaquetado: reconciliar `antara` con `main`** —
§2.1 y §2.2 muestran que hoy ya están bifurcadas en ambas direcciones, y esa es
la deuda que hay que pagar antes de extraer `@sanruiz/mall-frontend-core`.

La señal de que el core está listo para empaquetarse es la de §2: ningún
archivo de core menciona un mall concreto, y cada mall lo extiende sólo por
composición (como el `proxy.ts` de ANIMA) y configuración (`mallSettings`).
