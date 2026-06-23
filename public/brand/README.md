# Assets de marca — Ánima Village

Pon aquí los elementos de identidad para replicar el diseño del sitio actual.
Todo lo que esté en `public/` se sirve estático (ej. este archivo sería
accesible en `/brand/README.md`).

## Qué dejar

- **Logos (SVG):** los SVG de Ánima, Instagram, "A destination by SOMA", etc.
  Nómbralos claro: `logo-anima.svg`, `logo-soma.svg`, `icon-instagram.svg`.
- **Fuentes:** los archivos `.woff2` / `.woff` (preferido) o `.ttf` en
  `public/fonts/`. Si son de pago (Adobe Fonts/cliente), necesitamos los
  archivos con licencia o el embed code.
- **Colores:** un `colors.md` o `colors.json` con los hex de la paleta
  (fondo, texto, acentos). Si tienes brand guide en PDF, déjalo también.
- **Imágenes/videos clave** del home (hero) si quieres replicarlos: pueden ser
  los mismos del CDN de Webflow o copias locales.

## Tokens CSS de marca

La paleta está documentada en `colors.md`.

```css
:root {
  --color-brown: #4b3d2a;
  --color-rose: #ca9a8e;
  --color-warm-gray: #d1c1a8;
  --color-sage: #626a56;
  --color-blue-gray: #9db0ac;
  --color-gold: #bd9b60;

  --font-primary: "Cardo", serif;
}

h1 {
  font-family: var(--font-primary);
  font-size: 40px;
  line-height: 1;
  font-weight: 400;
}

h2, h3 {
  font-family: var(--font-primary);
  font-size: 15px;
  line-height: 18px;
  font-weight: 400;
}

body {
  font-family: var(--font-primary);
  font-size: 9px;
  line-height: 12px;
  font-weight: 400;
}
```

## Estructura sugerida

```
public/
  brand/
    logo-anima.svg
    logo-soma.svg
    icon-instagram.svg
    colors.md
  fonts/
    NombreFuente-Regular.woff2
    NombreFuente-Medium.woff2
```
