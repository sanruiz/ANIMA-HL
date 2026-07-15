# Event Date Formatter - 2-Minute Executive Summary

> Para WordPress Headless + Next.js con **i18n (multi-idioma)**
>
> **NOTA:** La solución recomendada para producción usa **`date-fns`** (no arrays).  
> ✅ Multi-idioma nativo | ✅ SSR compatible | ✅ Bajo mantenimiento  

## El Problema

Necesitas mostrar fechas de eventos de forma legible en **múltiples idiomas**:
- Single day: `"11 de julio"`
- With time: `"11 de julio a las 14:00"`
- Range: `"11 de julio al 13 de julio"`
- Range + time: `"11 de julio al 13 de julio de 10:00 a 18:00"`

---

## La Solución

**Una función JavaScript que toma 5 parámetros (incluyendo `locale`).**

```typescript
formatEventDateRange({
  startDate: "20250711",      // YYYYMMDD o YYYY-MM-DD
  endDate: "20250713",        // Opcional
  startTime: "10:00",         // Opcional
  endTime: "18:00",           // Opcional
  locale: "es"                // ← NUEVO: "es" | "en" | "fr" | "de"
})
// Español: "11 de julio al 13 de julio de 10:00 a 18:00"

formatEventDateRange({
  startDate: "20250711",
  startTime: "14:00",
  locale: "en"
})
// Inglés: "11 July at 14:00"
```

---

## La Lógica (en 30 segundos)

```
¿start_date? NO → ""
¿start_date? SÍ → Parse + Format (con date-fns)
    ↓
¿end_date & diferente? NO → single date
¿end_date & diferente? SÍ → date range
    ↓
¿Horas? → Agregar al output (respetando formato de idioma)
    ↓
Return string (ej: "11 de julio a las 14:00")
```

**Con date-fns:** Meses y formatos se manejan automáticamente en 4 idiomas.

---

## Implementación Mínima (Copy-Paste) - CON DATE-FNS ✅

```bash
npm install date-fns
```

```typescript
// lib/eventDateFormatter.ts

import { format, parse, isValid } from 'date-fns';
import { es, en, fr, de } from 'date-fns/locale';

const LOCALE_MAP = { es, en, fr, de } as const;
export type Locale = keyof typeof LOCALE_MAP;

function parseDate(d: string): Date | null {
  if (!d) return null;
  let date: Date;
  if (d.length === 8 && /^\d{8}$/.test(d)) {
    const y = d.substring(0, 4);
    const m = d.substring(4, 6);
    const day = d.substring(6, 8);
    date = parse(`${y}-${m}-${day}`, 'yyyy-MM-dd', new Date());
  } else if (d.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    date = parse(d, 'yyyy-MM-dd', new Date());
  } else {
    return null;
  }
  return isValid(date) ? date : null;
}

export function formatEventDateRange({
  startDate,
  endDate,
  startTime,
  endTime,
  locale = 'es',
}: {
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  locale?: Locale;
} = {}): string {
  if (!startDate) return '';

  const start = parseDate(startDate);
  if (!start) return '';

  const dateLocale = LOCALE_MAP[locale];
  const startStr = format(start, 'd MMMM', { locale: dateLocale });

  const end = endDate && endDate !== startDate ? parseDate(endDate) : null;

  if (end) {
    const endStr = format(end, 'd MMMM', { locale: dateLocale });
    let output: string;
    switch (locale) {
      case 'es': output = `${startStr} al ${endStr}`; break;
      case 'en': output = `${startStr} to ${endStr}`; break;
      case 'fr': output = `${startStr} – ${endStr}`; break;
      case 'de': output = `${startStr} bis ${endStr}`; break;
      default: output = `${startStr} to ${endStr}`;
    }

    if (startTime && endTime) {
      switch (locale) {
        case 'es': output += ` de ${startTime} a ${endTime}`; break;
        case 'en': output += ` from ${startTime} to ${endTime}`; break;
        case 'fr': output += ` de ${startTime} à ${endTime}`; break;
        case 'de': output += ` von ${startTime} bis ${endTime}`; break;
      }
    } else if (startTime) {
      switch (locale) {
        case 'es': output += ` a las ${startTime}`; break;
        case 'en': output += ` at ${startTime}`; break;
        case 'fr': output += ` à ${startTime}`; break;
        case 'de': output += ` um ${startTime}`; break;
      }
    }
    return output;
  }

  let output = startStr;
  if (startTime) {
    switch (locale) {
      case 'es': output += ` a las ${startTime}`; break;
      case 'en': output += ` at ${startTime}`; break;
      case 'fr': output += ` à ${startTime}`; break;
      case 'de': output += ` um ${startTime}`; break;
    }
  }
  return output;
}
```

---

## Uso en React

```tsx
import { formatEventDateRange } from '@/lib/eventDateFormatter';

export function EventCard({ event }) {
  const dateText = formatEventDateRange({
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
  });

  return (
    <div>
      <h3>{event.title}</h3>
      <p>📅 {dateText}</p>
    </div>
  );
}
```

---

## Los 4 Casos

| Entrada | Salida |
|---------|--------|
| `{ startDate: "20250711" }` | `"11 de julio"` |
| `{ startDate: "20250711", startTime: "14:00" }` | `"11 de julio a las 14:00"` |
| `{ startDate: "20250711", endDate: "20250713" }` | `"11 de julio al 13 de julio"` |
| `{ startDate: "20250711", endDate: "20250713", startTime: "10:00", endTime: "18:00" }` | `"11 de julio al 13 de julio de 10:00 a 18:00"` |

---

## Testing

```typescript
test('Single date', () => {
  expect(formatEventDateRange({ startDate: '20250711' })).toBe('11 de julio');
});

test('With time', () => {
  expect(formatEventDateRange({ startDate: '20250711', startTime: '14:00' }))
    .toBe('11 de julio a las 14:00');
});

test('Range', () => {
  expect(formatEventDateRange({ startDate: '20250711', endDate: '20250713' }))
    .toBe('11 de julio al 13 de julio');
});

test('Full', () => {
  expect(formatEventDateRange({
    startDate: '20250711',
    endDate: '20250713',
    startTime: '10:00',
    endTime: '18:00',
  })).toBe('11 de julio al 13 de julio de 10:00 a 18:00');
});
```

---

## Checkpoints

✅ Crear `lib/eventDateFormatter.ts`  
✅ Copiar código (arriba)  
✅ Usar en componentes  
✅ Test cases  
✅ Integrar con API  

---

## FAQ

**¿Qué formatos de fecha soporta?**  
→ `YYYYMMDD` (20250711) o `YYYY-MM-DD` (2025-07-11)

**¿Qué pasa si la fecha es inválida?**  
→ Retorna cadena vacía

**¿Puedo agregar más idiomas?**  
→ Sí, crear más arrays de meses en `toSpanish()`

**¿Performance?**  
→ O(1), no hay queries DB, puro string parsing

**¿Browser support?**  
→ Todos (solo usa Date nativo)

---

## Documentación Completa

Para más detalles, ver:
- 📖 [Full Guide](./EVENT-DATE-FORMATTING-GUIDE.md)
- 📋 [Quick Ref](./EVENT-DATE-QUICK-REFERENCE.md)
- 🎨 [Visual Guide](./EVENT-DATE-VISUAL-GUIDE.md)
- 🚀 [Tutorial](./NEXTJS-IMPLEMENTATION-TUTORIAL.md)

---

**Total lines of code: ~50 | Time to implement: 5 minutes**
