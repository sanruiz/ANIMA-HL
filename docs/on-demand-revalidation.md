# Revalidación on-demand

Cómo un cambio en WordPress se refleja en el frontend en segundos en vez de esperar hasta una hora.

---

## El problema

Las páginas cachean los datos de WordPress con `revalidate: 3600`. Si el cliente corrige el teléfono de una marca a las 10:00, el cambio puede no verse hasta las 11:00. Subir el TTL empeora la experiencia de edición; bajarlo multiplica las consultas a WordPress.

La solución no es cambiar el TTL, sino **invalidar el caché justo cuando algo cambia**, dejando la hora como red de seguridad.

---

## Cómo funciona

```
WordPress                          Next.js (Vercel)
─────────                          ────────────────
save_post ─┐
deleted_post ─┼─► Revalidator ──POST──► /api/revalidate ──► revalidateTag()
attachment_updated ─┘   (shutdown)      x-revalidate-secret
```

1. Al guardar o borrar contenido, la clase `Revalidator` del plugin encola qué cambió.
2. En `shutdown` (una sola vez por request) hace `POST` no bloqueante al endpoint.
3. El endpoint valida el secreto, traduce el payload a cache tags e invalida.

Es **best-effort a propósito**: si la petición falla, el sitio se refresca igual en la siguiente hora. Una caída del frontend nunca bloquea la edición en wp-admin.

---

## Cache tags

Los tags son el contrato entre los dos repos. Se construyen en `src/lib/cache-tags.ts`, nunca como literales sueltos: un typo no da error, simplemente deja de invalidar.

| Tag | Cubre |
|---|---|
| `wp:brands` | listado de marcas, gastronomy, carrusel, sitemap |
| `wp:brand:<slug>` | una marca |
| `wp:events` | agenda |
| `wp:event:<slug>` | un evento |
| `wp:posts` | blog y sitemap |
| `wp:post:<slug>` | una nota |
| `wp:pages` | páginas de WordPress |
| `wp:page:<uri>` | una página |
| `wp:assets` | media proxied por `/assets` |

Los tags **no llevan idioma**. `/es` y `/en` comparten el mismo fetch tag, así que una invalidación refresca ambos.

---

## El endpoint

`POST /api/revalidate`, con el secreto en el header `x-revalidate-secret` (no en query string, para que no quede en logs de acceso ni en URLs del dashboard).

```jsonc
// un cambio concreto
{ "type": "brand", "slug": "nike" }   // → wp:brands + wp:brand:nike

// tags explícitos
{ "tags": ["wp:events"] }

// todo (botón manual)
{ "all": true }
```

Respuestas: `200` con los tags invalidados, `401` secreto inválido o sin configurar, `400` payload sin nada accionable.

Usa `revalidateTag(tag, { expire: 0 })`. En Next 16 el segundo argumento es obligatorio; `{ expire: 0 }` es el perfil documentado para webhooks y hace que el siguiente visitante vea contenido fresco. La alternativa `"max"` sirve stale-while-revalidate, que aquí no queremos: el cliente edita y quiere comprobar de inmediato.

### Seguridad

- Comparación del secreto en tiempo constante (`timingSafeEqual`).
- **Falla cerrado**: sin `REVALIDATE_SECRET` definido responde `401`, en vez de quedar como endpoint abierto.
- Todo el payload se trata como no confiable: tipos desconocidos y tags mal formados se descartan, con tope de 50 tags.

---

## Configuración

**Vercel** — variable de entorno:

```
REVALIDATE_SECRET=<cadena larga y aleatoria>
```

**WordPress** — en `wp-config.php`:

```php
define( 'ANIMA_REVALIDATE_URL', 'https://www.animavillage.com/api/revalidate' );
define( 'ANIMA_REVALIDATE_SECRET', '<el mismo valor>' );
```

Van en constantes y no en la tabla de opciones, para que no aparezcan en un dump de base de datos ni en plugins que listan opciones.

Sin ambas constantes el plugin no envía nada y el botón manual no aparece.

---

## Disparo manual

Botón **"Revalidate frontend"** en la barra de administración de WordPress (visible para `manage_options`). Invalida todos los tags de colección.

Sirve para cuando el contenido cambia por fuera de wp-admin: importaciones, `wp-cli`, SQL directo — casos donde no corren los hooks. Como los de hoy, precisamente.

---

## Prueba manual

```bash
curl -i -X POST https://www.animavillage.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"type":"brand","slug":"nike"}'
```

---

## Archivos

| Archivo | Rol |
|---|---|
| `src/lib/cache-tags.ts` | construcción de tags (fuente única) |
| `src/lib/revalidation.ts` | parseo y validación del payload (puro, testeable) |
| `src/app/api/revalidate/route.ts` | endpoint |
| `includes/class-revalidator.php` | emisor, en el plugin SOMA |

---

## Limitaciones conocidas

- **Cambios en taxonomías** (renombrar una categoría de evento) no disparan nada; usa el botón manual.
- **Cache de LiteSpeed en WordPress**: las respuestas GET del REST API se cachean 7 días en el servidor. No afecta a este flujo, que usa GraphQL por POST, pero sí a cualquier otro consumidor REST.
- El envío es no bloqueante, así que **no se inspecciona la respuesta**. Los fallos solo se registran con `WP_DEBUG` activo. El botón manual sí es bloqueante y muestra el resultado.
