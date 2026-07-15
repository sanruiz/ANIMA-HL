# Cómo Se Listan Los Eventos en el Home

> Explicación clara y sencilla del sistema de filtrado y ordenamiento de eventos

---

## 📋 Concepto General

El home muestra **eventos que están sucediendo ahora o van a suceder en el futuro**, ordenados del **más cercano al más lejano**. Los eventos pasados nunca se muestran (a menos que entres a la página individual del evento).

---

## 🎯 Los 3 Niveles de Lógica

### **Nivel 1: Identificar Qué Eventos Son "Pasados"**

Cada día, un **proceso automático en background** revisa todos los eventos y pregunta:

> ¿La fecha final del evento ya pasó?

**Las reglas:**
- Si el evento tiene `end_date` → ¿es anterior a hoy? → **Pasado**
- Si el evento NO tiene `end_date` → ¿el `start_date` ya pasó? → **Pasado**

Si es pasado, WordPress **etiqueta automáticamente** el evento con la etiqueta `"eventos-pasados"` (es como ponerle una bandera roja).

**Ejemplo Real:**
- Evento "Concierto" con `start_date: 2024-06-15` (ya pasó)
- El 15 de junio, WordPress etiqueta automáticamente: `evento → "eventos-pasados"` ✓

---

### **Nivel 2: Filtrar en el Home**

Cuando necesitas mostrar eventos (en el home o en cualquier página), WordPress dice:

> "Dame todos los eventos **EXCEPTO** los etiquetados como `eventos-pasados`"

Esto excluye automáticamente los eventos viejos. **Es simple: solo una exclusión por etiqueta.**

**Ventaja:** No necesitas revisar fechas cada vez que cargas el home. La etiqueta está lista 24/7.

---

### **Nivel 3: Ordenar**

Una vez que tienes solo los eventos "vivos" (no pasados), los ordena así:

> "Ordena por `start_date` de menor a mayor (ASC)"

Esto hace que:
- Primero aparezcan los eventos que empiezan **pronto**
- Al final, los que empiezan en el futuro lejano

**Ejemplo de Orden Real:**
```
1. "Concierto" → start_date: 2025-07-20 ← Aparece primero (más cercano)
2. "Festival" → start_date: 2025-08-15
3. "Carnaval" → start_date: 2025-12-01 ← Aparece último (más lejano)
```

---

## 🏠 El Home en Específico: 2 Secciones

El home tiene **2 tipos de listas de eventos**:

### **Sección 1: "Todos los Eventos"** (o Similar)

| Aspecto | Valor |
|---------|-------|
| **Muestra** | Todos los próximos eventos |
| **Filtro** | Excluye `eventos-pasados` |
| **Orden** | Por fecha más cercana (ASC) |
| **Query ID** | `"events_closest_first"` |
| **Función** | `elementor_events_query_modification()` |

---

### **Sección 2: "Eventos Destacados"** (o Similar)

| Aspecto | Valor |
|---------|-------|
| **Muestra** | Solo eventos marcados como "Featured on Homepage" |
| **Filtros** | 1. Excluye `eventos-pasados` 2. Solo `featured = 1` ✓ |
| **Orden** | Por fecha más cercana (ASC) |
| **Query ID** | `"featured_events"` |
| **Función** | `elementor_featured_events_query_modification()` |

---

## 🔄 El Flujo Completo en el Home

```
Visitante entra al home
    ↓
Elementor dice: "Necesito eventos"
    ↓
WordPress busca:
  1. ¿Tiene la etiqueta "eventos-pasados"? NO ✓
  2. ¿Tiene featured = 1? (solo en sección destacados)
  3. ¿Cuál es el start_date?
    ↓
Ordena por start_date (más cercano primero)
    ↓
Muestra:
  - Sección 1: "Próximos eventos" (10 eventos, ordenados)
  - Sección 2: "Destacados" (3-5 eventos, ordenados)
```

---

## 🤖 Lo Inteligente: El Proceso Automático

**¿Quién decide qué eventos son pasados?**

No es manual. Hay un **proceso automático que corre cada día** (en background) que:

1. Revisa **TODOS** los eventos
2. Compara sus fechas (`start_date`, `end_date`) con hoy
3. Si están pasados, les pone la etiqueta `"eventos-pasados"`
4. Si aún no han pasado, la quita

**Archivo responsable:** `includes/update-events.php`

**Ventaja principal:** El home **SIEMPRE** muestra la información correcta sin que alguien tenga que ir y "publicar/despublicar" eventos manualmente.

---

## 📊 Tabla Resumen: Qué se Excluye vs Qué se Muestra

| Caso | ¿Se Muestra en Home? | ¿Por Qué? |
|------|----------------------|-----------|
| Evento pasado (2024) | ❌ No | Tiene etiqueta `eventos-pasados` |
| Evento hoy | ✅ Sí | No tiene etiqueta; aparece primero |
| Evento próxima semana | ✅ Sí | No tiene etiqueta; ordenado por fecha |
| Evento en diciembre | ✅ Sí | No tiene etiqueta; ordenado al final |
| Evento destacado pero pasado | ❌ No | Aunque es destacado, tiene `eventos-pasados` |
| Evento destacado y futuro | ✅ Sí | Ambas condiciones se cumplen |

---

## 🛠️ Componentes del Sistema

### **1. Proceso Automático (Backend)**
- **Archivo:** `includes/update-events.php`
- **Frecuencia:** Diariamente (WordPress cron)
- **Qué hace:** Etiqueta automáticamente eventos pasados

### **2. Filtrado en Queries (WordPress)**
- **Archivo:** `functions.php`
- **Funciones:**
  - `sort_events_by_closest_date()` - General (archives, home)
  - `elementor_events_query_modification()` - Sección "Todos"
  - `elementor_featured_events_query_modification()` - Sección "Destacados"
- **Qué hace:** Excluye `eventos-pasados` y ordena por fecha

### **3. Configuración en Elementor**
- **Widget:** Loop Grid
- **Query ID:** `"events_closest_first"` o `"featured_events"`
- **Número de posts:** Configurable (10, 5, 20, etc.)

---

## 💡 Cómo Configurar un Evento como "Destacado"

En WordPress Admin:
1. Edita un evento
2. Ve a ACF Fields
3. Busca "Featured on Homepage"
4. Marca ✓ la opción
5. Guarda

**Automáticamente:**
- Desaparece de "Todos" si ya está ahí
- Aparece en sección "Destacados"
- Se ordena con otros destacados por fecha

---

## ⚠️ Casos Especiales

### Evento Pasado pero Visitado Directamente

Si alguien va a `/events/concierto-viejo/`:
- ✅ **SÍ se ve** el evento (aunque sea pasado)
- La página individual del evento **NO aplica los filtros**
- Solo aplican en archives/listados

**Razón:** Un visitante puede querer ver un evento pasado (para leer detalles, fotos, etc.).

---

## 🔧 Archivos Clave del Sistema

```
plazasatelite/
├── includes/
│   ├── update-events.php          ← Proceso automático diario
│   └── ...
├── functions.php                  ← Filtrado y ordenamiento
└── docs/
    └── HOME-EVENTS-LISTING-LOGIC.md ← Este archivo
```

---

## 📝 Resumen en 1 Frase

> **El home muestra automáticamente los eventos que no están marcados como pasados, ordenados del más cercano al más lejano, usando 2 secciones diferentes: todos los próximos eventos y los destacados.**

---

## ❓ Preguntas Frecuentes

### P: ¿Qué pasa si creo un evento hoy?
R: Aparece en el home **en el mismo momento** (no necesita cron, está en el futuro).

### P: ¿Y si edito la fecha a una fecha pasada?
R: El **siguiente cron diario** (mañana) lo etiquetará como `eventos-pasados` y desaparecerá del home.

### P: ¿Puedo ver eventos pasados en el home?
R: No, a menos que los desmarques manualmente quitando la etiqueta `eventos-pasados` (no recomendado).

### P: ¿Los eventos destacados aparecen también en "Todos"?
R: No, si están en "Destacados" no aparecen en "Todos" (son secciones separadas con diferentes queries).

### P: ¿Qué pasa si un evento no tiene `end_date`?
R: Se considera pasado cuando `start_date` < hoy. Si no tiene fecha final, el `start_date` es la fecha de referencia.

---

## 🎓 Próximos Pasos

- [EVENT-DATE-FORMATTING-GUIDE.md](./EVENT-DATE-FORMATTING-GUIDE.md) - Cómo formatea las fechas para mostrar
- [WORDPRESS-HEADLESS-NEXTJS-I18N.md](./WORDPRESS-HEADLESS-NEXTJS-I18N.md) - Si usas Next.js frontend
- [AUTO-UNPUBLISH-DOCUMENTATION.md](./AUTO-UNPUBLISH-DOCUMENTATION.md) - Más detalles del proceso automático
