# Ánima Village — Frontend (headless)

Frontend en **Next.js 16 (App Router) + TypeScript + next-intl**, que consume el
contenido de WordPress vía **WPGraphQL**. Bilingüe ES/EN con rutas `/es` y `/en`.

## Arquitectura

```
WordPress (CMS)  →  WPGraphQL  →  Next.js (este repo)  →  Vercel/CDN  →  Visitante
   ↑ plugins: ACF Pro, WPGraphQL, WPGraphQL for ACF, WP Multilang
```

El contenido (eventos = CPT `event`, marcas = CPT `brand`), los ajustes del mall
(`mallSettings`) y los menús de navegación viven en WordPress y se editan ahí.
Este repo solo lee datos y renderiza.

**Parte del código de `src/` es compartido** con otros malls — ver
[Core compartido](#core-compartido).

## Requisitos

- Node.js 20+ (tienes 22).
- Un WordPress corriendo con estos plugins activos:
  - **WPGraphQL** (expone el endpoint `/graphql`).
  - **sanruiz-mall-core** (registra los CPT `event`, `brand`, `deal` y
    `job_offer` ya marcados con `show_in_graphql`, la página de opciones
    `mallSettings`, las ubicaciones de menú y el cron de eventos pasados).
    Sustituyó a `soma-malls-content-types`; producción corre la 0.6.2.
  - **Advanced Custom Fields Pro** + **WPGraphQL for ACF** (para que los campos
    custom aparezcan en el schema — falta verificar `show_in_graphql` por field group).
  - **WP Multilang** (idiomas; el frontend pide contenido con `?lang=es|en`).

## Arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar el endpoint de WordPress
cp .env.example .env.local
# edita .env.local y confirma WORDPRESS_API_URL (URL de tu sitio Local + /graphql)

# 3. Levantar en desarrollo
npm run dev
# abre http://localhost:3000  → redirige a /es
```

Páginas incluidas: `/` (home), `/agenda` (eventos), `/marcas` (marcas), en ambos
idiomas.

### Certificado SSL de Local (importante)

Local sirve por HTTPS con un certificado **autofirmado**, y Node rechaza esos
certs por defecto. El fetch del servidor a WordPress fallaría.

- `npm run dev` arranca con `NODE_TLS_REJECT_UNAUTHORIZED=0`, que desactiva la
  verificación TLS **solo para el dev server local**. Es seguro aquí porque solo
  hablas con tu propio WordPress de Local, y `build`/`start` (producción) NO
  llevan ese flag. (`--use-system-ca` no sirve: Node no lo permite en NODE_OPTIONS
  y `next dev` usa procesos hijos.)
- `npm run dev:strict` = `next dev` sin el flag, para cuando apuntes a un WP con
  certificado válido.
- Alternativa segura manteniendo verificación: exporta el certificado de Local
  (en Local: tu sitio → SSL) y apunta `NODE_EXTRA_CA_CERTS=/ruta/al/cert.pem`.

Prueba rápida del endpoint: abre `https://anima-headless.local/graphql` en el
navegador; deberías ver el IDE de GraphiQL o una respuesta JSON.

## Estructura

```
src/
  app/[locale]/(site)/   # rutas públicas: home, about, agenda, arte, blog,
                         # brands, gastronomy, map, y (wp-pages) para páginas
                         # servidas por URI desde WordPress
  app/api/               # revalidate (ISR on-demand) y el .ics de eventos
  app/assets/            # proxy de media de WordPress
  components/            # componentes de marca de ANIMA + ui/ (shadcn)
  i18n/                  # config de next-intl (routing, request, navigation)
  lib/                   # core compartido + extensiones de ANIMA (ver abajo)
messages/                # traducciones de la UI (es.json, en.json)
```

## Core compartido

Este repo comparte su núcleo con [`sanruiz-mall-frontend-starter`](https://github.com/sanruiz/sanruiz-mall-frontend-starter),
el código común a todos los malls de la plataforma. La migración está
documentada en [docs/adopt-mall-frontend-starter-plan.md](docs/adopt-mall-frontend-starter-plan.md).

**La regla que separa las dos mitades:** si un archivo menciona el nombre, el
dominio, la paleta o la zona horaria de un mall concreto, no es core. Antes de
editar algo bajo `lib/` o `i18n/`, mira de qué lado está:

| Core — cambios van también al starter | De ANIMA — se quedan aquí |
|---|---|
| `lib/wp.ts`, `queries.ts`, `types.ts` | `lib/mall.ts` (identidad: nombre, dirección, zona horaria) |
| `lib/cache-tags.ts`, `revalidation.ts` | `lib/coming-soon.ts`, `redirects.ts` |
| `lib/events.ts`, `event-date-formatter.ts` | `lib/brand-taxonomy.ts` |
| `lib/event-calendar.ts`, `menus.ts`, `seo.ts` | `proxy.ts` (envuelve el del core) |
| `lib/utils.ts`, `wp-image.ts`, `i18n-tags.ts` | `app/[locale]/**` (rutas propias) |
| `lib/newsletter/*`, `lib/brands.ts` | `globals.css` (BEM de Webflow + tokens) |
| `i18n/*`, `app/api/revalidate`, `app/assets` | `components/` salvo `ui/` y `site/` |

Dos cosas que ANIMA tiene **por delante** del starter y deberían subir: el
campo `CONSENT` en `lib/newsletter/doppler.ts` y los `components/ui/*`, que son
una generación de shadcn más nueva.

## Decisiones técnicas

**Cliente GraphQL: `fetch` nativo (no graphql-request ni Apollo).**
Con Server Components + ISR, `fetch` nativo soporta la revalidación de Next
(`next: { revalidate }`) sin librerías extra, y maneja el `?lang=` de WP Multilang.
Si prefieres `graphql-request`, solo cambia `src/lib/wp.ts` (es una función).
Apollo solo conviene si necesitas un cache de cliente en el navegador, que aquí
no aplica.

**Bilingüe en dos capas:**
- Contenido (WordPress): WP Multilang; se pide con `?lang=es|en` en el endpoint.
- Interfaz (este repo): next-intl con `messages/*.json` y rutas `/es` `/en`.

## Variables de entorno

Las que importan, con su modo de fallo si faltan (`.env.example` tiene la
lista completa):

| Variable | Si falta |
|---|---|
| `WORDPRESS_API_URL` | No renderiza nada: no hay de dónde leer contenido. |
| `NEXT_PUBLIC_SITE_URL` | **Silencioso.** `lib/seo.ts` es core, así que su fallback es `your-mall.example.com`: los canonical, el Open Graph y el sitemap apuntarían ahí en vez de fallar. Obligatoria en todo entorno desplegado. |
| `DOPPLER_API_KEY`, `DOPPLER_ACCOUNT`, `DOPPLER_LIST_ID` | El formulario de newsletter devuelve error; no hay valores por defecto a propósito, para que la lista de un mall no reciba los contactos de otro. |
| `REVALIDATE_SECRET` | `/api/revalidate` responde 401 a todo (falla cerrado). |
| `COMING_SOON`, `PREVIEW_TOKEN` | Sin modo coming-soon; el sitio queda público. |
