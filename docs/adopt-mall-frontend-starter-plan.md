# Adoptar el core de `sanruiz-mall-frontend-starter` en ANIMA

Plan de migración para que ANIMA y Antara compartan el mismo core de Next.js,
como paso previo a empaquetarlo (`@sanruiz/mall-frontend-core`).

## Dos tracks, una sola migración

La migración tiene dos caras y **se hacen juntas, en la misma rama**
(`feature/CORE-001-adopt-mall-frontend-starter`), con una sola tabla de fases
(§7):

| Track | Qué mueve | Dónde está el detalle |
|---|---|---|
| **Código** | `src/lib`, `src/i18n`, `src/components` → core | Este documento |
| **Instrucciones** | skills, instructions y prompts de agentes → core | [`own-agent-tooling-plan.md`](./own-agent-tooling-plan.md) (anexo) |

> **Decisión 2026-10-17:** no se separan en dos ramas. Las skills del track de
> instrucciones documentan el core que el track de código construye —
> `mall-core-architecture` no se puede escribir antes de que el core exista
> aquí. Separarlas obligaría a una de las dos a esperar a que la otra haga
> merge. El anexo conserva su análisis; su secuencia la manda §7.

---

## Estado (2026-10-17)

Rama: `feature/CORE-001-adopt-mall-frontend-starter`, sin cambios bajo `src/`.

| | Estado |
|---|---|
| Documentación de los dos planes | ✅ `f41e861`, `8394767` |
| **D2** — convención de componentes | ✅ decidida y escrita en `CLAUDE.md`, `AGENTS.md` y `react-components.instructions.md` (`df09977`) |
| **Track instrucciones, fases A y B** | ✅ hechas (`62f8652`, `4f8e01c`, `0a65c6a`, `83b77cd`) |
| **Fases 0 a 9** (§7) | ❌ ninguna iniciada — salvo A y B del anexo, ya absorbidas (fila anterior) |
| **D1** — eventos pasados | ✅ **cerrada del lado de WordPress**: el bug del cron se arregló upstream y el término `eventos-pasados` quedó borrado el 2026-10-17 (§3D). El frontend adopta el slug en la Fase 2, no antes |

Medido el 2026-10-17 contra `https://backend.animavillage.com/graphql` y por
SSH (`wp plugin list`, `wp eval`): el backend corre `sanruiz-mall-core`
**0.6.2**, `mallSettings` ya responde con 9 de 14 campos en los dos idiomas y
`menus { nodes }` devuelve PRIMARY y FOOTER (todo escrito ese día — §1 y
Fase 0), y `src/lib/` no tiene ninguno de los módulos del core (`menus.ts`,
`brands.ts`, `event-calendar.ts`, `server-utils.ts`, `newsletter/`,
`use-mobile-menu.ts`, `use-scroll-carousel.ts`), ni existe
`src/components/site/`.

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

> **Corrección 2026-10-17 — `mallSettings` no estaba "sin capturar".**
> Los valores existían: `wp option list --search='options_*'` mostraba
> `options_mall_name`, `options_tagline` y `options_address` con contenido,
> y las claves ACF companion (`_options_<campo> = field_sanruiz_mall_<campo>`)
> estaban todas. Lo que pasaba es que estaban guardados **con un solo
> segmento de idioma** — `[:en]Ánima Village[:]` — y el español es el idioma
> por defecto del endpoint, así que WP Multilang devolvía vacío y GraphQL
> `null`. Consultando `?lang=en` aparecían.
>
> Es un modo de fallo que conviene recordar para cualquier campo de este
> backend: **un `null` en GraphQL puede ser "no hay dato" o "el dato está en
> el otro idioma"**, y sólo se distinguen leyendo la opción cruda o pidiendo
> el otro `?lang=`.
>
> **Resuelto el mismo día**: los campos se reescribieron bilingües y se
> llenaron los que faltaban (ver Fase 0).

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

> **Actualización 2026-10-17 — la etiqueta ya no está vacía, y el riesgo se cerró solo.**
>
> El bug del cron (§4) **se arregló upstream en `sanruiz-mall-core` 0.6.1**
> (2026-10-12); el backend de ANIMA corre hoy **0.6.2**. Verificado por SSH:
> el código ahora compara `current_time('Ymd')` contra un `normalize_date()`
> de la fecha ACF, y el CHANGELOG describe exactamente el fallo de §4.
>
> Resultado de que el cron volviera a funcionar, medido con `wp eval` el
> 2026-10-17 (`hoy = 20261017`):
>
> | Conjunto | Eventos | Qué son |
> |---|---|---|
> | Con ambas etiquetas | 47 | el histórico de siempre |
> | Sólo `past-events` | 4 | publicados, fechas 2026-10-02 a 10-16 — los que etiquetó el cron ya arreglado |
> | Sólo `eventos-pasados` | 6 | **todos en `draft`** — invisibles para el frontend |
> | Publicados sin `past-events` | 4 | fechas 2026-10-18 a 10-29, todos futuros ✅ |
>
> **Ni un solo evento futuro quedó marcado como pasado**, y nada publicado
> depende en exclusiva de `eventos-pasados`. El `PAST_EVENT_TAG_SLUG =
> "past-events"` del core ya encuentra el dato correcto en ANIMA sin tocar
> nada.
>
> Consecuencia para **D1**: la opción (a) se reduce a **borrar el término
> `eventos-pasados`**. No hay que re-etiquetar nada ni reportar el bug.
>
> **Ejecutado el 2026-10-17** (`wp term delete event_tag 2`): el término ya no
> existe. `event_tag` queda en `past-events` (51), `community` (31),
> `wellness` (21) y `arte-abierto` (3), confirmado por wp-cli y por GraphQL.
> Los 6 borradores perdieron su única etiqueta, que es lo esperado: no se
> publican y la clasificación la hace la fecha.
>
> **El frontend no se toca todavía, a propósito** (decisión 2026-10-17).
> `src/lib/events.ts:4` sigue declarando
> `PAST_EVENT_TAG_SLUG = "eventos-pasados"`, un slug que ya no existe en el
> backend. No es un descuido ni un bug a corregir suelto: `isPastEvent()` es
> un OR y `isPastByDate()` clasifica bien los 51 eventos, así que la
> constante es inerte. Se corrige sola en la **Fase 2**, cuando el
> `events.ts` del core reemplace al de ANIMA.

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

> **Re-verificado el 2026-10-17:** `sanruiz-mall-core` **0.6.2** y
> `wp-multilang` 2.4.34; el resto igual. Las dos versiones nuevas del plugin
> (0.6.1 y 0.6.2) son sólo correcciones —capacidades del rol editorial y el
> cron de eventos pasados—, ninguna toca el contrato de GraphQL, así que no
> afectan a esta migración más allá de lo dicho abajo.

**ANIMA ya está migrada del lado de WordPress.** `soma-malls-content-types` ya
no existe aquí — lo que queda desactualizado son nuestros propios documentos:
`.env.example` y `docs/HOME-EVENTS-LISTING-LOGIC.md` todavía lo nombran. Hay
que corregirlos (Fase 6).

### 🔴 Bug en `sanruiz-mall-core` 0.6.0 — el cron no etiqueta los eventos del año en curso

> **2026-10-17 — ARREGLADO upstream, esto queda como registro.** El fix salió
> en **0.6.1** (2026-10-12) y el backend de ANIMA corre **0.6.2**. El
> CHANGELOG del plugin describe el mismo fallo que se analiza abajo —
> incluido el efecto del 1 de enero— y el código ya normaliza a `Ymd` los dos
> operandos. **No hay nada que reportar.**
>
> **Tampoco queda nada para Antara:** su copia local (`backend-antara`) ya
> está en **0.6.1** —verificado el 2026-10-17 en el encabezado del plugin—,
> que es justo la versión que trae el fix. Lo de abajo describe el 0.5.0 que
> corría entonces.

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

## 5. Decisiones

### D1 — Eventos pasados

§4 confirma que el plugin instalado escribe `past-events`, así que migrar el
dato **no se revierte solo**. Pero también confirma que el cron que lo escribiría
está roto, y que la clasificación real la hace la fecha en el frontend.

> **Resuelta de hecho el 2026-10-17 → va la opción (a).** El cron arreglado
> (0.6.2) ya dejó `past-events` como la etiqueta real y correcta: 51
> eventos, ningún futuro marcado, y lo que sólo tiene `eventos-pasados` son
> 6 borradores (§3D). La opción (b) pierde su razón de ser —el core no
> necesita un slug configurable para una deuda que ya no existe— y (c) sería
> dejar viva una etiqueta huérfana.
>
> **Queda un solo paso, en la Fase 0:** borrar el término `eventos-pasados`
> (`wp term delete event_tag 2`). No hay que re-etiquetar nada.

| Opción | Qué implica |
|---|---|
| **a) Migrar el dato en WP** ✅ **elegida y ejecutada (2026-10-17)** | ~~Re-etiquetar los 47 eventos~~ — lo hizo el cron. ~~Borrar el término `eventos-pasados`~~ — hecho. El core queda intacto y ANIMA = Antara. |
| b) Hacer el slug configurable | `PAST_EVENT_TAG_SLUG` sale de env. No se toca el dato, pero el core gana una opción que existe sólo por deuda histórica de ANIMA. |
| c) No hacer nada por ahora | Defendible: §3D mide impacto cero hoy. Deja la deuda viva. |

~~En los tres casos conviene reportar el bug del cron (§4) al repo del
plugin.~~ **Ya está arreglado** en 0.6.1, y los dos malls corren una versión
que lo incluye — ANIMA 0.6.2, Antara 0.6.1 (§4). Nada que hacer.

### D2 — Convención de componentes ✅ DECIDIDA (2026-10-05)

**ANIMA adopta la convención del core.** `CLAUDE.md` y
`.github/instructions/react-components.instructions.md` ya están actualizados.

| | ANIMA (antes) | Core (ahora) |
|---|---|---|
| Archivo | `PascalCase.tsx` plano / `kebab/index.tsx` | `kebab-case.tsx` plano en carpeta de dominio |
| Export | `export default function` | `export function` (nombrado) |
| Barrel `index.ts` | documentado, **nunca implementado** | no existe; import por ruta directa |
| Props | `interface <Name>Props` aparte | tipadas inline; `export type` si se comparten |
| Componentes por archivo | uno | varios si se usan juntos (`page-state.tsx`) |

Estado real medido: 31 archivos `PascalCase.tsx` + 11 carpetas `kebab/index.tsx`,
**todos** con `export default`, y **cero** barrels — o sea, la regla vieja del
barrel nunca se cumplió.

**Todo componente nuevo sigue ya la convención del core.** La conversión de los
42 existentes va como fase propia (Fase 7), después de la migración del core:
mezclarla con el swap de core haría ilegible el diff.

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
globals.css (3093 líneas BEM de Webflow)         42 componentes de marca → src/components/anima/
GA4 (@next/third-parties), Vercel Analytics, lottie-react, iconos de app
```

**`proxy.ts` es la prueba de fuego del split.** El coming-soon de ANIMA debe
**envolver** el `createMiddleware(routing)` del core, no forkearlo. Si se logra
sin tocar el archivo de core, el corte está bien hecho y el paquete va a
funcionar.

---

## 7. Fases

Una sola secuencia para los dos tracks. Las fases **A** y **B** del anexo ya
están hechas (`62f8652`, `4f8e01c`, `0a65c6a`, `83b77cd`): cortaron el riesgo de
que `restore` pisara el trabajo de D2 y podaron el tooling de WordPress/Jira.
Lo que quedaba de ese track —la Fase C— es ahora la **Fase 8**.

| Fase | Track | Contenido | Commit |
|---|---|---|---|
| **0** | WP | ✅ **Completa (2026-10-17)**: `mallSettings` escrito, D1 cerrada y los menús PRIMARY/FOOTER creados y asignados. Detalle abajo. | — (WP) |
| **1** | Código | Subir `next` y las deps del core a **la versión que el core corra hoy** (el 2026-10-05 era 16.3.8; ANIMA está en 16.2.9 — confirmar antes de fijar número). `typecheck && test && build` verde. | `chore: align deps with mall core` |
| **2** | Código | Reemplazar los archivos de core por los de `main` + hunks de §2.1. Re-aplicar fix CONSENT. ANIMA aún no usa lo nuevo. | `refactor: adopt mall-frontend-starter core` |
| **3** | Código | Portar de `antara`: `event-calendar`, `brands.ts`, `server-utils`, `breadcrumbs`, tests. | `feat: port core modules from antara` |
| **4** | Código | Adaptar las extensiones de ANIMA (`proxy.ts` como wrapper, `agenda/` sobre `events.ts`). | `refactor: rebuild ANIMA extensions on core` |
| **5** | Código | **Reconciliar** la capa de tokens shadcn que ANIMA ya tiene (ver abajo) con la que esperan los `components/ui/*` del core, **sin tocar** el BEM existente. | `refactor: reconcile shadcn token layer` |
| **6** | Docs | `README` del core compartido + corregir las referencias a `soma-malls-content-types` (ver abajo). (`CLAUDE.md` ya quedó hecho con D2.) | `docs: document shared core` |
| **7** | Código | Convertir los 42 componentes a la convención del core (D2): de `PascalCase.tsx` / `kebab/index.tsx` a `kebab-case.tsx` plano bajo `src/components/anima/`, con named export. Mecánico, sin cambios de comportamiento. | `refactor: convert components to core convention` |
| **8** | Instrucciones | Fase C del anexo: montar la carpeta de agentes en el core (D3 opción c), escribir las 6 skills de su §6 contra el core ya estabilizado, portar `stack-context` y los partials, conectar ANIMA y Antara al sync. | `feat: own the agent tooling in the core` |
| **9** | Docs | Cierre: borrar **los dos** planes (éste y el anexo). | `docs: close the core migration` |

**Por qué la Fase 8 va después de la 7, y no después de la 4** (el anexo decía
"después de la Fase 4"): `mall-core-architecture` documenta la convención de
D2, y la Fase 7 es justo la que la aplica a 42 archivos. Escribir la skill
antes sería documentar un repo que todavía contradice su propia regla.

**Y por eso borrar los planes se mueve a la Fase 9.** La Fase 6 ya no los
borra: la Fase 8 todavía necesita el anexo.

Verificación en cada fase: `npm run typecheck && npm run lint && npm test && npm run build`.

### Fase 0 — qué quedó escrito en `mallSettings` (2026-10-17)

Escrito por wp-cli vía SSH (`wp option update`, y `wp eval` para la dirección
multilínea), con respaldo previo de las 16 opciones. Los campos traducibles van
bilingües; URLs y coordenadas van sin marcadores, que WP Multilang deja pasar
igual en los dos idiomas:

| Campo | Antes | Ahora |
|---|---|---|
| `mallName` | `[:en]Ánima Village[:]` → `null` en ES | Ánima Village (ES/EN) |
| `tagline` | texto **español** dentro del segmento `[:en]` | EN: *A destination where brands, wellness, art and nature converge* · ES: *Un destino donde marcas, bienestar, arte y naturaleza convergen* |
| `address` | sólo `[:en]` | Cabo Del Sol / Carretera Transpeninsular Km 10.3 / Cabo San Lucas, B.C.S. / 23455 — `Mexico` en EN, `México` en ES |
| `openingHours` | vacío | EN: *Monday to Sunday: 11:00 AM – 9:00 PM* · ES: *Lunes a Domingo: 11:00 AM – 9:00 PM* |
| `website` | vacío | `https://animavillage.com/` |
| `mapUrl` | vacío | el enlace de direcciones que ya usaba el footer |
| `latitude` / `longitude` | vacío | `22.921293` / `-109.83783` |
| `instagramUrl` | vacío | `https://www.instagram.com/animavillagecabo` |

**Quedan vacíos a propósito: `email`, `phone`, `facebookUrl`, `tiktokUrl`,
`youtubeUrl`.** No hay fuente: el sitio en vivo sólo enlaza Instagram, y el
`gmajul@animavillage.com` de `subscribe.ts` es el destinatario de las
notificaciones del newsletter, no un contacto público — publicarlo en
`mallSettings` sería inventar un dato.

Dos puntos que se levantaron y quedaron **aprobados el 2026-10-17**:

- **La traducción inglesa del tagline la redactamos aquí** a partir del español
  que ya estaba, y se confirmó como válida. Mismo criterio para el resto del
  contenido bilingüe: redactar la traducción faltante es bienvenido, no hay que
  esperar una versión oficial.
- **La dirección** de `mallSettings` ("Cabo Del Sol, Carretera Transpeninsular
  Km 10.3") es la correcta, aunque el enlace de Google diga "Tourist Corridor".
  Se conserva.

### Fase 0 — los menús PRIMARY y FOOTER (2026-10-17)

No había **ningún** menú en WordPress; las ubicaciones `primary` y `footer` sí
estaban registradas, por el tema activo (`sanruiz-mall-blank-theme`), no por
el plugin. Ojo con esto al diagnosticar: `wp menu location list --skip-themes`
las muestra vacías.

Se crearon los dos menús copiando la navegación que el frontend ya tiene
quemada, para que el swap de la Fase 2 no cambie nada visible:

| PRIMARY (de `SiteHeader`) | FOOTER (de "What We Offer") |
|---|---|
| Brands / Marcas → `/brands` | Brands / Marcas → `/brands` |
| Gastronomy / Gastronomía → `/gastronomy` | Arte Abierto → `https://arteabierto.org/` (`_blank`) |
| Events / Agenda → `/agenda` | Gastronomy / Gastronomía → `/gastronomy` |
| Arte Abierto → `/arte` | Programming / Programación → `/agenda` |
| Map / Mapa → `/map` | News / Noticias → `/blog` |
| Blog → `/blog` | |
| About / Nosotros → `/about` | |

**Las etiquetas divergen entre header y footer a propósito**, porque así está
el sitio hoy: `/agenda` es "Events/Agenda" arriba y "Programming/Programación"
abajo; `/blog` es "Blog" arriba y "News/Noticias" abajo. Se reprodujo tal
cual; unificarlo es una decisión de contenido, no de migración.

Dos detalles técnicos que valen para cualquier mall:

- **El título de un ítem de menú se escribe dos veces.**
  `wp_update_nav_menu_item()` dispara `save_post` y WP Multilang aplana el
  valor, así que la cadena bilingüe entra después con `$wpdb`.
- **Las URLs quedan sin prefijo de idioma** (`/brands` en los dos idiomas),
  así que el `toHref()` que se rescata de `antara` (§2.1) no tiene nada que
  recortar en estos ítems. Sigue haciendo falta para menús construidos desde
  wp-admin apuntando a páginas de WP, que sí llevan prefijo.

**Lo que no entró al menú FOOTER:** los enlaces legales (Aviso de Privacidad)
y los de redes y créditos. Hoy están quemados en `SiteFooter` y ahí se quedan
hasta la Fase 4, cuando se decida qué parte del footer es core y qué es de
ANIMA.

### Barrido de cobertura multilang (2026-10-17)

El fallo de `mallSettings` —dato presente pero en un solo segmento de idioma—
podía estar en más sitios, así que se barrió todo el contenido publicado
(`brand`, `event`, `page`, `post`, más las taxonomías) resolviendo cada campo
con `wpm_translate_string()` en los dos idiomas y comparando.

| Resultado | Cantidad |
|---|---|
| Campos vacíos en **inglés** con texto en español | **8** → corregidos |
| Campos vacíos en **español** | 0 |
| Prosa sin marcadores (español llegando al visitante inglés) | 0 |

Los 8 eran 7 títulos de eventos de agosto de 2026 —todos ya en
`past-events`, visibles en el archivo— y el título de la página `home`. Se
les añadió el segmento `[:en]` escribiendo directo a `wp_posts` con `$wpdb`,
porque pasar por `wp_update_post` dispara `save_post` y WP Multilang aplana
el valor al idioma actual (el mismo motivo que documenta
`backend-ssh-access.md`):

| ES | EN |
|---|---|
| Derivas de arte y arquitectura | Art and Architecture Drifts |
| Poesía del desierto | Desert Poetry |
| Cardones de colores | Cardones in Color |
| Splash Zone & Bubbles ×3, Sunset Breathwork | igual en ambos — ya estaban en inglés |

Lo que el barrido marca como "sin marcadores" en volumen (356 campos de
marcas, 225 de eventos) **no es deuda**: son datos no traducibles —`store`,
`phone`, `days`, `time`, `featured`— y las únicas cadenas largas de ese grupo
resultaron ser arrays serializados de `gallery`. Y los ~70 "idénticos en ambos
idiomas" son nombres propios de marcas y eventos, correctos tal cual.

**Conclusión: la cobertura bilingüe del backend está sana.** Si en el futuro
un campo aparece vacío en un idioma, el primer sospechoso es el segmento
faltante, no el dato ausente.

### Fase 5 — la capa shadcn ya existe, hay que reconciliarla, no crearla

Medido el 2026-10-17: `globals.css` ya define los tokens shadcn en dos bloques
—claro en las líneas 97-114 y oscuro en las 316-333, mapeados sobre las
variables de marca (`--background: var(--color-claro)`,
`--primary: var(--color-gold)`…)— y `src/components/ui/` ya tiene `badge`,
`button` y `card`. Nada de eso vino de esta migración; es trabajo previo en
`master`.

Así que la fase es un diff, no una construcción: **qué tokens referencian los
`components/ui/*` del core que ANIMA no define** (candidatos típicos: `--card`,
`--popover`, `--muted`, `--accent`, `--border`, `--input`, `--destructive` y
sus `-foreground`), y qué primitivas trae el core además de las tres que ya
están. Un `ui/*` del core que lea un token inexistente no rompe el build:
falla en silencio, en color. El inventario se hace al llegar a la fase, contra
el core real.

### Fase 6 — dónde está realmente `soma-malls-content-types`

La lista original nombraba `.env.example`, que no lo menciona. Los archivos que
sí lo hacen son cuatro:

| Archivo | Qué hacer |
|---|---|
| `src/lib/queries.ts` | se resuelve solo: es un archivo de core, lo reemplaza la Fase 2 |
| `src/lib/types.ts` | ídem |
| `README.md` | corregir aquí |
| `docs/HOME-EVENTS-LISTING-LOGIC.md` | corregir aquí |

---

## 8. Hacia el paquete (fuera de alcance, pero lo condiciona)

Al terminar, ANIMA y Antara tendrán el mismo core en tres lugares (`main`,
`antara`, ANIMA). **Paso 0 del empaquetado: reconciliar `antara` con `main`** —
§2.1 y §2.2 muestran que hoy ya están bifurcadas en ambas direcciones, y esa es
la deuda que hay que pagar antes de extraer `@sanruiz/mall-frontend-core`.

La señal de que el core está listo para empaquetarse es la de §2: ningún
archivo de core menciona un mall concreto, y cada mall lo extiende sólo por
composición (como el `proxy.ts` de ANIMA) y configuración (`mallSettings`).

El track de instrucciones apunta al mismo lugar: la Fase 8 deja las skills en
el core, junto al código que describen, y la misma prueba les aplica — una
skill que nombre a ANIMA o a Antara no es del core. Si los dos tracks llegan,
`@sanruiz/mall-frontend-core` se empaqueta con su propia documentación de
agentes dentro.
