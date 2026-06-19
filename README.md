# Ánima Village — Frontend (headless)

Frontend en **Next.js 16 (App Router) + TypeScript + next-intl**, que consume el
contenido de WordPress vía **WPGraphQL**. Bilingüe ES/EN con rutas `/es` y `/en`.

## Arquitectura

```
WordPress (CMS)  →  WPGraphQL  →  Next.js (este repo)  →  Vercel/CDN  →  Visitante
   ↑ plugins: ACF Pro, WPGraphQL, WPGraphQL for ACF, WP Multilang
```

El contenido (eventos = CPT `event`, marcas = CPT `brand`) vive en WordPress y se
edita ahí. Este repo solo lee datos y renderiza.

## Requisitos

- Node.js 20+ (tienes 22).
- Un WordPress corriendo con estos plugins activos:
  - **WPGraphQL** (expone el endpoint `/graphql`).
  - **soma-malls-content-types** (registra los CPT `event`, `brand`, `deal` y ya
    los marca con `show_in_graphql`).
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
  app/[locale]/        # rutas por idioma (layout, home, agenda, marcas)
  components/          # SiteHeader, LocaleSwitcher
  i18n/                # config de next-intl (routing, request, navigation)
  lib/
    wp.ts              # cliente GraphQL (fetch nativo + ISR + ?lang=)
    queries.ts         # queries de events y brands
    types.ts           # tipos de los CPT
messages/              # traducciones de la UI (es.json, en.json)
```

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

## Pendientes (próximos pasos)

1. Confirmar la URL del endpoint en `.env.local`.
2. Verificar que cada field group de ACF tenga `show_in_graphql=true` y añadir esos
   campos a `src/lib/queries.ts`.
3. Habilitar `event` y `brand` para traducción en WP Multilang.
4. Páginas de detalle (`/agenda/[slug]`, `/marcas/[slug]`).
5. SEO: metadata por idioma, `hreflang`, sitemap.
6. Formulario newsletter → reusar el proxy Doppler existente en Vercel.
7. Deploy a Vercel.
