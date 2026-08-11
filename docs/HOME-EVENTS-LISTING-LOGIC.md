# Cómo Se Listan los Eventos (`/agenda`)

> Refleja la implementación real en el repo Next.js (`ANIMA-HL`), no la del CMS de WordPress.

## Dato importante: no hay eventos en el Home

El home (`src/app/[locale]/(site)/page.tsx`) renderiza `VideoHero`, `OurSoul`, `OfferBanner` y `DailyRituals` — ninguno de estos componentes lee eventos. **No existe hoy una sección de "eventos" ni "eventos destacados" en el home.** Todo el listado, filtrado y ordenamiento de eventos vive exclusivamente en la ruta **`/agenda`**:

- `src/app/[locale]/(site)/agenda/page.tsx` — listado completo (próximos + pasados)
- `src/app/[locale]/(site)/agenda/[slug]/page.tsx` — detalle de un evento individual

Si en el futuro se agrega una sección de eventos al home, este documento debe actualizarse — hoy no aplica.

## De dónde vienen los datos

WordPress (headless, plugin `soma-malls-content-types` + ACF + WPGraphQL) vive en **otro repositorio**. Este repo solo consume la API GraphQL vía `fetchGraphQL()` (`src/lib/wp.ts`).

`EVENTS_QUERY` (`src/lib/queries.ts`) pide **todos** los eventos en una sola llamada, ordenados por `DATE DESC` a nivel WordPress (ese orden es solo el de la respuesta cruda; el orden final que ve el usuario se recalcula en TypeScript, ver abajo):

```graphql
events(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
  nodes {
    id title slug date excerpt
    featuredImage { node { sourceUrl altText } }
    eventTags { nodes { name slug } }
    eventFields {
      startDate startTime endDate endTime place featured
      gallery { nodes { sourceUrl altText } }
    }
  }
}
```

- `eventFields.featured` **existe en el esquema y se consulta**, pero **no se usa en ningún lugar del código de eventos hoy** (no hay sección de "destacados" para eventos). El único lugar del repo donde un flag `featured` sí filtra contenido es en **marcas** (`brandFields.featured`, usado por `FeaturedBrandsCarousel` en `/brands` y `/gastronomy`) — es un dominio distinto, no confundir.
- La página `/agenda` (`agenda/page.tsx`) llama a `EVENTS_QUERY` una sola vez con revalidación (`revalidate: 3600`, cache tag `collectionTag("event")` → `"wp:events"`), y separa el resultado en dos arreglos con `getUpcomingEvents()` / `getPastEvents()`.

## Pasado vs. próximo: se calcula en Next.js, no en WordPress

Todo vive en `src/lib/events.ts` (96 líneas). No hay cron de WordPress ni `functions.php` en este repo — ese código, si existe, está en el repo de WordPress y **no puede documentarse ni verificarse desde aquí**.

```ts
export const PAST_EVENT_TAG_SLUG = "eventos-pasados";

export function isPastEvent(event: EventNode, today = new Date()): boolean {
  return hasPastEventTag(event) || isPastByDate(event, todayKey);
}
```

Un evento se considera **pasado** si se cumple cualquiera de estas dos condiciones (evaluadas en cada request):

1. **Override manual por tag**: el evento tiene la etiqueta de taxonomía `eventos-pasados` en `eventTags` (viene de WordPress; este repo solo la lee, no la asigna).
2. **Por fecha**: la fecha de referencia del evento (`endDate` si existe, si no `startDate`, si no el `date` del post de WP) es anterior a hoy — comparando enteros `YYYYMMDD` en UTC, mismo mecanismo que usa `parseEventDate()` (ver `docs/README-EVENT-DATE-FORMATTER.md`).

**Diferencia clave con el diseño legado:** antes se documentaba un cron diario de WordPress que etiquetaba/desetiquetaba eventos. Eso ya no es necesario para que este front-end funcione: `isPastEvent()`/`getUpcomingEvents()`/`getPastEvents()` recalculan el estado "pasado" en cada request a partir de las fechas, sin depender de que ningún proceso batch haya corrido. El tag `eventos-pasados` solo se respeta como señal manual adicional, si WordPress lo sigue asignando.

## Filtrado y orden

```ts
getUpcomingEvents(events, today)
```
- Excluye eventos con el tag `eventos-pasados` **y** eventos cuya fecha de referencia ya pasó.
- Ordena ascendente por `startDate` (más cercano primero); si dos eventos empatan en fecha, ordena por título (`localeCompare`).

```ts
getPastEvents(events, today)
```
- Incluye eventos pasados por tag **o** por fecha.
- Ordena **descendente** por fecha de referencia (más reciente primero); empate por título.

`agenda/page.tsx` llama a ambas funciones sobre el mismo array crudo de `EVENTS_QUERY` y pasa los dos resultados a `<AgendaEventsList upcomingEvents={...} pastEvents={...} />`.

## Cómo se renderiza `/agenda`

`src/components/agenda-events-list/index.tsx` (client component):

- Recibe `upcomingEvents` y `pastEvents` ya separados y ordenados — no vuelve a decidir qué es pasado.
- Construye un filtro de categorías a partir de los `eventTags` de **ambos** arreglos combinados (excluyendo siempre `eventos-pasados`), como un set de tabs "Todos" + una por tag. El filtro es 100% client-side (`useState`), sin nueva consulta a WordPress.
- Renderiza dos secciones dentro de la misma lista: próximos primero, luego "pasados" debajo (con su propio heading/empty-state), ambas afectadas por el filtro de categoría activo.
- Cada fila (`EventRow`) usa `parseEventDate()` para el chip de día/mes-año, y `formatEventDateRange()` para la línea de fecha legible (ver el otro documento). Si `isPast`, se aplican estilos atenuados y un badge distinto en vez del tag de categoría.

`src/components/event-detail/index.tsx` (`/agenda/[slug]`, server component) no aplica ningún filtro de pasado/futuro — un evento pasado sigue siendo visible en su propia página; solo se le oculta el link "Agregar al calendario" (`isPastEvent(event) ? null : getCalendarLink(event)`).

## Tabla resumen

| Caso | ¿Se muestra en `/agenda`? | ¿Dónde? |
|---|---|---|
| Evento futuro, sin tag `eventos-pasados` | ✅ Sí | Sección "próximos", ordenado por fecha ascendente |
| Evento de hoy | ✅ Sí | Sección "próximos" (su fecha de referencia no es `< hoy`) |
| Evento con `endDate` pasado pero `startDate` futuro | ❌ No (se usa `endDate` como referencia) | Sección "pasados" |
| Evento sin tag pasado pero con fecha ya vencida | ❌ No | Sección "pasados", recalculado en cada request |
| Evento con tag `eventos-pasados` pero fecha futura | ❌ No (el tag manda) | Sección "pasados" |
| Visita directa a `/agenda/[slug]` de un evento pasado | ✅ Sí, se ve completo | Sin filtro en la página de detalle; solo se oculta "Agregar al calendario" |

## Preguntas frecuentes

**¿Hay un cron o proceso batch en este repo que actualice el estado "pasado"?**
No. Se recalcula en cada request desde las fechas. El tag `eventos-pasados` es solo un override manual opcional que, si WordPress lo asigna, este repo respeta.

**¿Puedo marcar un evento como "destacado" y que aparezca en otra sección?**
No hoy — `eventFields.featured` se consulta pero no se usa en ningún componente de eventos. Si se necesita esa funcionalidad, hay que construirla (filtrar por `fields?.featured` y decidir dónde renderizarla; no hay sección de home para eventos todavía).

**¿Qué pasa si un evento no tiene `endDate`?**
Se considera pasado cuando `startDate` (o el `date` del post si `startDate` está vacío) es anterior a hoy.

**¿Dónde vive la lógica de "past event" del lado de WordPress (si existe)?**
Fuera de este repo. No hay `functions.php` ni PHP alguno en `ANIMA-HL` — es puramente un consumidor de WPGraphQL (ver `README.md` del repo y `src/lib/cache-tags.ts`, que documenta la división de responsabilidades entre ambos codebases).

## Ver también

- [README-EVENT-DATE-FORMATTER.md](./README-EVENT-DATE-FORMATTER.md) — cómo se formatean fecha y hora para mostrar (incluye el cambio a formato 12H AM/PM)
- `src/lib/events.ts` — código fuente de todo lo descrito aquí
- `src/lib/cache-tags.ts` — contrato de cache tags entre este repo y WordPress
