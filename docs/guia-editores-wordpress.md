# Guía rápida para editores — Ánima Village

Cómo cargar y editar contenido en WordPress. El sitio público (animavillage.com) se alimenta de aquí, así que todo lo que publiques aparece en línea en cuestión de segundos.

**Acceso:** [backend.animavillage.com/wp-admin](https://backend.animavillage.com/wp-admin)

---

## Lo más importante: las dos pestañas de idioma

Arriba de cada ficha hay dos pestañas:

> 🇺🇸 **English (US)**  |  🇲🇽 **Español (MX)**

El sitio existe en los dos idiomas. Cada pestaña guarda **su propio texto**, y al cambiar de pestaña el contenido del editor cambia con ella.

**Regla de oro: nunca publiques sin haber llenado las dos pestañas.**

Si dejas una vacía, esa versión del sitio se queda sin ese texto. Si escribes lo mismo en ambas, se ve igual en los dos idiomas — que a veces es lo correcto (nombres de marca como "Nike", "Music & Sunset").

Qué se traduce y qué no:

| Se traduce | No se traduce |
|---|---|
| Título | Imagen destacada y galería |
| Descripción / contenido | Fechas y horas |
| Campos de texto (teléfono, horario, ubicación) | Categorías (ya están traducidas) |

Los campos como teléfono, correo o "Monday to Sunday" también guardan versión por idioma. Escribe **el mismo valor en las dos pestañas** salvo que de verdad cambie, como el horario en palabras.

⚠️ **Nunca escribas códigos como `[:en]...[:es]...[:]` a mano.** WordPress los pone solo. Si los ves en el editor, avísale a Santiago y no guardes.

---

## Marcas (menú **Brands**)

**Crear:** Brands → Add New Brand.

1. **Título**: el nombre de la marca. Suele ser igual en ambos idiomas.
2. **Descripción**: el texto del cuerpo, en cada pestaña de idioma.
3. **Brand Categories** (columna derecha): marca las que apliquen — Women, Men, Kids, Beauty, Gastronomy, Interiors, Technology. Gastronomy tiene subcategorías (Cafe & Specialty, Fine Dining, Restaurants).
4. **Imagen destacada** (columna derecha, abajo): el logo o la foto principal.
5. Bloque **Brands**, más abajo:

| Campo | Qué va ahí |
|---|---|
| Store | Ubicación dentro del Village (ej. "Pasaje del Amanecer") |
| Phone | Teléfono. Formato `+52 624 104 6301` |
| Email | Correo de contacto |
| Website | Sitio web, con `https://` |
| Days | Días de atención (ej. "Monday to Sunday") |
| Time | Horario (ej. "11:00 AM – 8:00 PM") |
| Featured | Sí = aparece en el carrusel de destacadas del home |
| Pet Friendly | Si admite mascotas |
| Gallery | Fotos adicionales de tienda o campaña |

Si una marca no tiene teléfono o correo, deja el campo vacío. No escribas "N/A".

6. **Publish** (o **Update** si ya existía).

---

## Eventos (menú **Events**)

**Crear:** Events → Add New Event.

1. **Título** y **descripción** en las dos pestañas de idioma.
2. **Event Tags** (columna derecha): elige la categoría — **Community**, **Wellness** o **Arte Abierto**.
3. **Imagen destacada**.
4. Bloque de campos del evento:

| Campo | Qué va ahí |
|---|---|
| Event start date | Fecha de inicio. Obligatoria |
| Event start time | Hora de inicio. Opcional |
| Event end date | Solo para eventos de varios días |
| Event end time | Hora de fin. Opcional |
| Place | Dónde ocurre (ej. "Plaza del Alma") |
| Event gallery | Fotos adicionales |

5. **Publish**.

**Eventos que se repiten:** para un taller que ocurre cada semana, lo más rápido es abrir uno existente, usar la fecha como referencia y crear uno nuevo con el mismo texto y otra fecha. Así los dos idiomas quedan consistentes.

🚫 **No toques la etiqueta "Past Events".** WordPress la pone sola cuando el evento pasa, y es lo que hace que desaparezca de la agenda. Si la marcas a mano, el evento se oculta antes de tiempo.

---

## Notas del blog (menú **Posts**)

Funciona como un WordPress normal: título, contenido, imagen destacada, publicar. Igual que en todo lo demás, llena las **dos pestañas de idioma**.

---

## Imágenes

- Súbelas desde el propio contenido (Add Media) o desde **Media → Add New**.
- Ponles un nombre descriptivo antes de subirlas (`nike-tienda-01.jpg`, no `IMG_4821.jpg`).
- **No subas una imagen con el mismo nombre de archivo que otra que ya exista** con intención de reemplazarla. Sube una nueva y cámbiala en la ficha: si sobrescribes, la versión vieja puede quedar guardada en el sitio hasta un año.
- La imagen destacada es la misma para los dos idiomas; se pone una sola vez.

---

## Ver el cambio en el sitio

Al dar **Publish** o **Update**, el sitio se actualiza solo en unos segundos. Refresca la página pública y ahí está.

Si cambiaste algo y **no** se ve después de un par de minutos, usa el botón **"Revalidate frontend"** en la barra negra de arriba. Fuerza la actualización de todo el sitio.

---

## Errores comunes

| Síntoma | Causa y solución |
|---|---|
| La página en inglés muestra texto en español | Se publicó con la pestaña de inglés vacía o con el texto en español. Abre la ficha, ve a English (US), corrige y actualiza |
| El evento no aparece en la agenda | Revisa que **Event start date** esté puesta y que la fecha no haya pasado. Revisa que no tenga la etiqueta "Past Events" |
| La marca no sale en el directorio | Falta asignarle **Brand Categories**, o quedó en borrador en vez de publicada |
| No aparece en el carrusel del home | El campo **Featured** debe estar en Sí |
| Veo códigos raros tipo `[:en]` en el editor | No guardes. Avisa a Santiago |

---

## Antes de publicar, revisa

- [ ] Las dos pestañas de idioma tienen texto
- [ ] Imagen destacada puesta
- [ ] Categorías marcadas
- [ ] En eventos: fecha de inicio y lugar
- [ ] En marcas: ubicación, y teléfono o correo si los hay

---

*¿Dudas o algo que se ve raro en el sitio? Escríbele a Santiago antes de intentar arreglarlo desde el admin.*
