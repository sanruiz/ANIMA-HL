# Modo Coming Soon

Página de mantenimiento pública (`/coming-soon`, bilingüe ES/EN) que se sirve a
todo el público mientras el sitio está en desarrollo, con bypass por token para
el equipo.

## Cómo funciona

- `src/app/[locale]/coming-soon/page.tsx` — página standalone (sin header/footer
  del sitio; el chrome global vive ahora en el route group `(site)/layout.tsx`).
- `src/lib/coming-soon.ts` — lógica pura del modo (testeada en
  `coming-soon.test.ts`).
- `src/proxy.ts` — si `COMING_SOON=true` y no hay cookie de bypass, hace
  *rewrite* de cualquier ruta a `/{locale}/coming-soon` (la URL del navegador no
  cambia). Excluye `api`, assets de Next y archivos con extensión.

## Variables de entorno

| Variable | Valor | Efecto |
| --- | --- | --- |
| `COMING_SOON` | `true` / cualquier otro | Activa/desactiva el modo |
| `PREVIEW_TOKEN` | string secreto | Token del bypass. Vacío = sin bypass |

## Ver las páginas internas (equipo)

1. Visita cualquier URL con `?preview=<PREVIEW_TOKEN>` — p. ej.
   `https://tusitio.vercel.app/es/marcas?preview=anima2026`.
2. Se setea la cookie `anima_preview` (30 días, httpOnly) y se redirige a la URL
   limpia. Desde ahí navegas todo el sitio normal.
3. Para volver a ver el coming soon como el público: `?preview=off`.

## Notas

- La página lleva `robots: noindex` porque se sirve en todas las URLs.
- Las marcas del marquee son estáticas (`coming-soon/brands.ts`, export del CMS
  de Webflow 2026-06-19) para no depender de WordPress.
- Mientras `WORDPRESS_API_URL` apunte al WP local, en Vercel las páginas
  internas mostrarán sus estados de error/fallback — esperado hasta hostear WP.
