# Colores de marca — Ánima Village (WEB)

**Fuente de verdad para el sitio: los valores usados en Webflow.**
La paleta PANTONE/CMYK del brand guide (`ANIMA_BrandGuidelines_2021.12.23.pdf`)
es **solo para impresión** — NO se usa en web (los hex difieren).

Estos son los tokens reales que maneja `src/app/globals.css`:

## Paleta web (Webflow)

| Rol | Variable CSS | Hex |
| --- | --- | --- |
| Fondo (claro) | `--color-claro` | `#faf7f3` |
| Texto / oscuro | `--color-oscuro` | `#453536` |
| Beige | `--color-beige` | `#e5d7c5` |
| Verde (sage) | `--color-verde` | `#626951` |
| Rosa | `--color-rosa` | `#b59289` |
| Oro (acento) | `--color-gold` | `#bd9b60` |
| Warm gray | `--color-warm-gray` | `#d1c1a8` |
| Blue gray | `--color-blue-gray` | `#9db0ac` |
| Rose | `--color-rose` | `#ca9a8e` |

## Variables CSS (referencia)

```css
:root {
  /* Tokens reales del sitio Webflow (Ánima Village) */
  --color-claro:  #faf7f3;  /* fondo */
  --color-oscuro: #453536;  /* texto / marrón oscuro */
  --color-beige:  #e5d7c5;
  --color-verde:  #626951;  /* verde / sage */
  --color-rosa:   #b59289;
  --color-gold:   #bd9b60;  /* acento */

  --color-warm-gray: #d1c1a8;
  --color-blue-gray: #9db0ac;
  --color-rose:      #ca9a8e;
}
```

## Nota de mantenimiento

Consolidado: el hex de cada color vive en un solo token canónico (nombres de
Webflow). `--color-brown` es alias de `--color-oscuro` (#453536) y `--color-sage`
es alias de `--color-verde` (#626951), así que para cambiar un tono se edita solo
el canónico. (`--color-rose` #ca9a8e y `--color-rosa` #b59289 son rosas distintos,
no duplicados.)

## Referencia impresión (NO web)

El brand guide define PANTONE 7554 C (#4b3d2a), 7612 C, Warm Gray 2 C, 7498 c,
5507 C, 7562 C. Son para material impreso; no coinciden con los de web.
