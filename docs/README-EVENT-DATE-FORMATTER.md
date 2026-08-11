# Event Date Formatter

> Formateo de fechas y horas de eventos para el front-end Next.js (`src/lib/event-date-formatter.ts`).
> WordPress (headless, vía WPGraphQL) es un repo separado — este documento cubre solo el lado Next.js.

## Dónde vive el código

| Archivo | Rol |
|---|---|
| `src/lib/event-date-formatter.ts` | `parseEventDate()` + `formatEventDateRange()` — el formateador central |
| `src/lib/event-date-formatter.test.ts` | Tests unitarios de ambas funciones |
| `src/components/agenda-events-list/index.tsx` | Lista `/agenda` — consume el formateador para la línea de fecha de cada fila |
| `src/components/event-detail/index.tsx` | Detalle `/agenda/[slug]` — consume el formateador y además genera el link `.ics` (formato distinto, ver abajo) |

No se usa `date-fns` ni ninguna librería externa: solo `Intl.DateTimeFormat` nativo + dos regex.

## Locales soportados

Solo `"es"` y `"en"` (los locales reales del sitio, definidos en `src/i18n/routing`). Cualquier valor que no sea `"en"` se trata como `"es"`. Internamente, `"en"` mapea al locale Intl `"en-GB"` (día antes que mes: `"11 July"`), y `"es"` usa el locale Intl `"es"`.

## Formatos de entrada aceptados

- **Fecha** (`startDate`/`endDate`): `YYYYMMDD`, `YYYY-MM-DD`, o el prefijo de fecha de un string ISO (`2025-07-11T00:00:00`). Se valida que sea una fecha calendario real — `"2025-02-31"` retorna `null`.
- **Hora** (`startTime`/`endTime`): `HH:MM` o `HH:MM:SS` en 24H, tal cual llega de ACF/WPGraphQL (los segundos se ignoran).

## Qué produce hoy: 12H con AM/PM

Desde el cambio de formato, `normalizeTime()` convierte la hora 24H de entrada a 12H con sufijo `AM`/`PM` (mayúsculas, sin puntos — misma convención que el resto del copy del sitio, ver `messages/es.json`/`messages/en.json`, ej. `"9 PM"`). Esto aplica igual en `es` y en `en`; solo cambia el texto que rodea la hora (`"a las"` vs `"at"`, `"de...a"` vs `"from...to"`).

```ts
formatEventDateRange({ startDate: "20250711" });
// "11 de julio"

formatEventDateRange({ startDate: "20250711", startTime: "14:00:00", locale: "es" });
// "11 de julio a las 2:00 PM"

formatEventDateRange({ startDate: "20250711", endDate: "20250713", locale: "es" });
// "11 de julio al 13 de julio"

formatEventDateRange({
  startDate: "20250711", endDate: "20250713",
  startTime: "10:00", endTime: "18:00", locale: "es",
});
// "11 de julio al 13 de julio de 10:00 AM a 6:00 PM"

formatEventDateRange({
  startDate: "20250711", endDate: "20250713",
  startTime: "10:00", endTime: "18:00", locale: "en",
});
// "11 July to 13 July from 10:00 AM to 6:00 PM"
```

## Lógica interna

```
¿startDate no parsea? → ""
¿startDate parsea? → formatear con Intl.DateTimeFormat (day: "numeric", month: "long", timeZone: "UTC")
    ↓
¿endDate parsea y su "key" (YYYYMMDD numérico) difiere del de startDate? → es un rango ("... al ..." / "... to ...")
    Si endDate es igual a startDate, se trata como fecha única (no rango).
    ↓
¿Hay startTime Y endTime, Y es un rango? → agrega " de {t1} a {t2}" / " from {t1} to {t2}" y retorna
¿Hay solo startTime (fecha única, o rango sin endTime)? → agrega " a las {t1}" / " at {t1}"
¿No hay horas? → retorna solo el label de fecha
```

**Caso límite documentado:** un rango con `startTime` pero sin `endTime` NO entra en la rama "rango + ambas horas" — cae en la rama de una sola hora y produce algo como `"11 de julio al 13 de julio a las 10:00 AM"` (la hora de inicio se pega al final del rango de fechas, sin mencionar que es la hora de inicio). Es el comportamiento actual, no un bug pendiente de arreglar; tenerlo en cuenta si se recibe contenido con `startTime` sin `endTime` en un rango de días.

## `parseEventDate()`

Exportada por separado porque `agenda-events-list` y `event-detail` también la usan para construir el atributo `dateTime` del `<time>` (vía `parsedDate.date.toISOString().slice(0, 10)`), y `src/lib/events.ts` la usa para calcular si un evento es pasado/futuro y para ordenar (ver `docs/HOME-EVENTS-LISTING-LOGIC.md`).

Retorna `{ date: Date, key: number }` o `null`. `key` es `YYYYMMDD` como número (ej. `20250711`), pensado para comparar/ordenar fechas sin reconstruir objetos `Date`. La fecha se construye con `Date.UTC(...)`, así que no hay desplazamiento por timezone del servidor.

## Lo que el formateador NO hace: el link "Agregar al calendario" (`.ics`)

`event-detail/index.tsx` (líneas 24-94) tiene su **propia** lógica de formateo de fecha/hora para generar el archivo `.ics` de descarga (`getCalendarLink()`, `formatCalendarDate()`, `formatCalendarDateTime()`). Esto es intencional y **no debe tocarse** al ajustar el formateador de visualización:

- El estándar iCalendar (`DTSTART`/`DTEND`) requiere `YYYYMMDDTHHMMSS` en 24H — no acepta AM/PM.
- Si el evento no tiene `startTime`, se genera un evento "todo el día" (`DTSTART;VALUE=DATE:...`), con `DTEND` calculado como `endDate + 1 día` (el estándar iCal usa fin exclusivo para eventos de día completo).
- El link se oculta por completo (`calendarLink = null`) si `isPastEvent(event)` es `true` — no tiene sentido agregar al calendario un evento que ya pasó.

## Testing

Ver `src/lib/event-date-formatter.test.ts` para los casos reales (fecha única, fecha única con hora, rango, rango con horas, ambos locales, valores inválidos). Actualiza esos tests si cambias cualquier regla de formateo — son la fuente de verdad, no este documento.
