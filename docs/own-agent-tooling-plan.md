# Dejar `@silverassist/agents-toolkit` y tener tooling de agentes propio en el core

Plan para que ANIMA deje de consumir el toolkit y las instrucciones de agentes
vivan en `sanruiz-mall-frontend-starter`, junto al core de código.

> Relacionado: `docs/adopt-mall-frontend-starter-plan.md`. Ese plan mueve el
> **código** al core; éste mueve las **instrucciones**. Comparten el destino y
> la secuencia.

---

## Veredicto

**Sí, y hay más razones de las que se ven a primera vista.** No es sólo que dos
skills enseñen la convención equivocada: el encaje del toolkit con este repo es
malo de raíz, y además **es dueño de archivos que acabamos de editar**.

---

## 1. Qué encaja y qué estorba hoy

Inventario de lo que el toolkit puso en ANIMA (versión anclada: **2.5.1**):

| Área | Volumen | Estado |
|---|---|---|
| `.agents/skills/` | 10 skills | **5 son sólo para plugins WordPress** (`create-component`, `plugin-creation`, `quality-checks` PHPCS/PHPStan, `release-management`, `testing` PHPUnit). 3 enseñan la convención que acabamos de descartar. `nextjs-caching` habla de "the CCDS API", que es otro proyecto. |
| `.github/instructions/` | 12 archivos, **2665 líneas** | **1256 líneas (47%) ya declaradas inaplicables** en nuestro propio `CLAUDE.md`: `php-standards`, `testing-standards` (PHPUnit), `wordpress-plugin-architecture`, `documentation-language`, `github-workflow`. No hay PHP en este repo. |
| `.claude/commands/` + `.github/prompts/` | 19 prompts × 2 = 38 archivos | 5 son de WordPress (`new-wp-component`, `new-wp-plugin`, `quality-check`, `prepare-release`, `prepare-github-release`). **9 referencian Jira** aunque `.agents-toolkit.json` ya dice `tracker: "github"` y ningún commit del repo usa un ticket de Jira. |
| `.github/hooks/` | 4 archivos | `validate-tsx` imponía la convención vieja (ya corregido a mano). |

Dicho de otra forma: **aproximadamente la mitad del tooling de agentes de este
repo describe un stack que no tenemos.**

---

## 2. El riesgo inmediato: el toolkit es dueño de lo que acabamos de editar

Esto es lo que vuelve el tema urgente y no cosmético.

El paquete 2.14.0 trae plantillas de:

```
templates/agents/AGENTS.md
templates/agents/CLAUDE.md
templates/agents/copilot-instructions.md
templates/shared/instructions/*.instructions.md
templates/shared/prompts/*.prompt.md
templates/shared/hooks/validate-tsx.json   ← el hook que acabamos de reescribir
templates/shared/skills/*
```

Y su CLI referencia `AGENTS.md`, `CLAUDE.md`, `copilot-instructions.md`,
`.claude/commands` y `.agents/skills`, con lógica de `force` / `overwrite` /
`merge`.

**El `CLAUDE.md` de ANIMA es un fork divergido de esa plantilla** — las primeras
secciones coinciden palabra por palabra con
`templates/agents/CLAUDE.md`. Y **no hay marcadores de bloque gestionado**
(`BEGIN:` / `END:`) en ninguno de los dos, así que el CLI no puede fusionar de
forma quirúrgica: o pisa o salta.

Traducción: **todo el trabajo de D2** (la convención de componentes en
`CLAUDE.md`, `AGENTS.md`, las instructions y el hook) está sobre archivos que el
toolkit considera suyos.

### Y la versión anclada ya no existe

`agents-toolkit-lock.json` fija **2.5.1**. Las versiones publicadas hoy son:

```
2.8.2  2.9.0  2.10.0  2.11.0  2.12.0  2.13.0  2.14.0
```

`npx @silverassist/agents-toolkit restore` **no puede reproducir el estado
vendoreado actual**: la versión fijada fue despublicada.

Sobre el `.gitignore`: al ejecutar la Fase A resultó ser menos grave de lo que
escribí aquí primero. 9 de las 10 skills **ya estaban trackeadas** —
`.gitignore` no des-trackea lo que ya entró— y `.github/skills/*` son symlinks
hacia `.agents/skills/`, también trackeados. La única realmente fuera de git era
`nextjs-caching`, añadida después de que se pusiera la regla. Ya está
commiteada.

---

## 3. Por qué "arreglarlo upstream" no es la salida

Era la opción barata, y no sirve: **2.14.0 sigue enseñando
`<carpeta>/index.tsx`** en `component-architecture`. No es un descuido, es el
estándar de Silver Assist, y los repos de plugins WordPress de la org lo siguen.
Cambiarlo a named-export plano para que nos sirva a nosotros **rompería esos
repos**.

Son dos convenciones legítimas para dos stacks distintos. La respuesta correcta
no es que una gane, es que cada quien tenga la suya.

> **Importante:** esto es *ANIMA deja de consumir el toolkit*, no *se retira el
> toolkit*. El paquete es de Silver Assist y otros repos lo siguen usando. No
> se toca.

---

## 4. Lo que NO hay que perder

El toolkit ha mejorado bastante desde 2.5.1, y 2.14.0 trae cosas genuinamente
buenas que hoy ANIMA no tiene:

- `stack-context` — detecta versiones instaladas y avisa cuándo Next/React están
  atrás, para no recomendar APIs de hace dos mayores. Útil de verdad en este repo.
- `core-review`, `github-review-management` — agentes de revisión.
- `tsdoc-standards`, los partials de git/PR.

**Portar la idea, no el archivo.** Si copiamos los buenos, hay que copiarlos una
vez y mantenerlos nosotros, no re-crear la dependencia.

---

## 5. D3 — Mecanismo de entrega (necesito tu decisión)

Las skills vivirían en el core y ANIMA + Antara las consumirían. La pregunta es
cómo. **El discriminador es si Copilot sigue en uso**, porque el toolkit existía
precisamente para servir a los dos.

Evidencia de que sí: `.github/copilot-instructions.md`, los hooks `PostToolUse`
de `.github/hooks/` son de Copilot, y `CLAUDE.md` dice literalmente
*"source of truth for both Claude & Copilot"*.

| Opción | Cubre | Costo |
|---|---|---|
| **a) Plugin de Claude Code** (`.claude-plugin/` en el core, `plugin add` por mall) | Sólo Claude Code | Bajo. Nativo, versionado con el core. **No sirve si Copilot sigue vivo.** |
| **b) Paquete npm propio con CLI tipo `restore`** | Claude + Copilot + Codex | Alto. Es re-hacer el toolkit — justo lo que estamos dejando. |
| **c) Carpeta en el core + script de sync** | Lo que decidamos | Medio. Sin registry, sin CLI que mantener. `npm run agents:sync` copia del core al mall. |
| **d) Git submodule** | Lo que decidamos | Medio-bajo, pero los submodules dan fricción diaria. |

### ✅ Decidido (2026-10-05): opción (c)

**Se siguen usando los dos agentes**, Copilot y Claude Code, según el momento.
Así que el mecanismo tiene que servir a `.github/` y a `.claude/` por igual —
(a) queda descartada.

Va **(c): carpeta en el core + script de sync**. Es lo honesto para el volumen
real (~15 archivos markdown): no hace falta un registry ni un CLI con lógica de
merge, que es justo lo que estamos dejando atrás.

Sobre la forma concreta hay un cabo suelto que hay que atar en la Fase C. El
repo ya tiene el patrón "archivos reales en `.agents/skills/`, symlinks desde
`.github/skills/`", **pero no está verificado que Copilot lea esa carpeta**:
nada en `copilot-instructions.md`, ni en los prompts, ni en los comandos
referencia `.github/skills/` ni un `SKILL.md`. Puede ser una convención que
inventó el toolkit.

Lo que sí está documentado que Copilot descubre es
`.github/copilot-instructions.md` y `.github/instructions/*.instructions.md`
con `applyTo`, más `.github/prompts/*.prompt.md`. **Antes de construir el sync
hay que confirmar la vía real de Copilot** y, si los symlinks no sirven, mover
ese contenido a `instructions/`. Dato extra en contra de los symlinks: no
sobreviven un checkout en Windows sin `core.symlinks=true`.

---

## 6. Alcance — qué escribir

La regla: **escribir sólo lo que nadie más puede escribir.** Guías genéricas de
Next.js o React ya existen (el propio `next-best-practices` y los skills de
Vercel vienen cargados). Lo que no existe fuera de aquí es el conocimiento de
*esta* plataforma:

| Skill propuesta | Por qué sólo puede vivir aquí |
|---|---|
| `mall-core-architecture` | La convención de componentes (D2), qué es core y qué es del mall, la regla de "si menciona un mall concreto ya no es core" |
| `wp-graphql-contract` | `cache-tags` ↔ el plugin, `mallSettings`, formas de campo de brand/event/deal/job offer |
| `wp-multilang` | Las etiquetas inline `[:en]…[:es]…[:]`, qué resuelve WP y qué normaliza Next, por qué escribir bilingüe exige wp-cli por SSH |
| `mall-caching` | ISR + cache tags + `/api/revalidate` + el proxy `/assets` (adaptar `nextjs-caching`, quitando lo de CCDS) |
| `mall-i18n-routing` | `localePrefix`, `getLocalizedPath`, hreflang, por qué ANIMA lleva prefijo siempre |
| `events-and-dates` | La lógica OR de pasado/próximo, `PAST_EVENT_TAG_SLUG`, el formateo de fechas |

Y portar de lo bueno del toolkit: `stack-context` y los partials de git/PR.

**Se descarta:** todo lo de PHP/WordPress-plugin (5 skills + 1256 líneas de
instructions + 5 prompts) y las referencias a Jira (el tracker es GitHub).

---

## 7. Secuenciación — importa

Las skills enseñan convenciones, y las convenciones **se estabilizan recién en
la Fase 4** del plan de core. Escribir `mall-core-architecture` ahora sería
documentar un core que ANIMA todavía no tiene.

| Cuándo | Qué |
|---|---|
| **Ahora** (independiente del plan de core) | Fases A y B de abajo: cortar el riesgo y limpiar lo muerto |
| **Después de la Fase 4 del plan de core** | Fase C: escribir el contenido de las skills |

### Fase A — Cortar el riesgo ✅ HECHA (2026-10-05)

1. ✅ Quitadas las tres líneas de skills del `.gitignore`; commiteada
   `nextjs-caching`, que era la única que faltaba.
2. ✅ Borrado `agents-toolkit-lock.json` (sólo lo leía el CLI).
   **`.agents-toolkit.json` se conserva** — y aquí hubo que corregir el plan:
   no es config del toolkit, es config del repo. Diez comandos la leen para
   resolver `BASE_BRANCH`, y sin ella caen al fallback `'main'` cuando la rama
   base es `master`. Borrarla habría reintroducido el bug del PR #27.
3. ✅ Nota en `CLAUDE.md` y `AGENTS.md`: no correr `restore` en este repo.

Con esto, el trabajo de D2 deja de estar a un comando de distancia de perderse.

### Fase B — Podar ✅ HECHA (2026-10-05)

Borrados, en ambas copias (`.claude/` y `.github/`):

- **5 skills** de WordPress: `create-component`, `plugin-creation`,
  `quality-checks`, `release-management`, `testing`.
- **5 instructions** muertas (1256L): `php-standards`, `testing-standards`,
  `wordpress-plugin-architecture`, `documentation-language`, `github-workflow`.
  No eran inertes: todas llevaban `applyTo: "**"`, así que `github-workflow`
  afirmaba `main` como rama base (aquí es `master`) y `documentation-language`
  imponía inglés (`docs/` está en español).
- **4 prompts** de WordPress/PHP: `new-wp-component`, `new-wp-plugin`,
  `prepare-release`, `quality-check`.
- **4 prompts gemelos de Jira** + el partial `jira-integration.md` (ver abajo).
- El partial `release-wordpress.md`.

#### Dos correcciones a este plan, encontradas al ejecutarlo

1. **`prepare-github-release` se queda.** El plan lo listaba para borrar, pero
   **ANIMA sí publica releases** (tags `v1.0.0`, `v1.1.0` y un release en
   GitHub). Lo que se quitó fue su rama de WordPress, dejándolo sólo en Node.
2. **No eran "referencias a Jira", eran prompts gemelos.** Cada flujo existe dos
   veces: `analyze-ticket`↔`analyze-github-issue`, `work-ticket`↔`work-github-issue`,
   `create-pr`↔`create-github-pr`, `finalize-pr`↔`finalize-github-pr`. Con
   `tracker: "github"` sobra la mitad de Jira entera, no sólo sus menciones.

#### Hallazgo: `.claude/` está en el `.gitignore` **global**

`~/.gitignore_global:8` ignora `.claude`. Por eso algunos archivos de
`.claude/commands/_partials/` (`release-node.md`, `release-wordpress.md`)
existían en disco pero **nunca entraron a git**, y los symlinks de
`.claude/skills/` tampoco están versionados — hoy el repo sólo trackea
`.github/skills/`.

Consecuencia para la Fase C: **lo que se deje en `.claude/` no viaja con el
repo** salvo que se fuerce (`git add -f`) o se neutralice la regla global desde
el `.gitignore` del repo. Hay que decidirlo antes de construir el sync, junto
con lo de los symlinks.

### Fase C — Construir en el core (después de Fase 4 del otro plan)

6. Crear la estructura en `sanruiz-mall-frontend-starter` según D3.
7. Escribir las 6 skills de §6 contra el core ya estabilizado.
8. Portar `stack-context` y los partials útiles.
9. Conectar ANIMA y Antara al mecanismo elegido; borrar de ANIMA lo que pase a
   vivir en el core.

---

## 8. Riesgo a vigilar

Lo que estamos haciendo es **cambiar una dependencia mantenida por otros por una
mantenida por nosotros**. El toolkit pasó de 2.5.1 a 2.14.0 en unos meses: ese
es trabajo que dejaremos de recibir gratis.

Se justifica porque la mitad de lo que entrega no aplica y porque nos impone una
convención incompatible. Pero si las skills del core se escriben y nadie las
vuelve a tocar en seis meses, estaremos peor que hoy. Mantenerlo acotado a las
6 skills de §6 — lo que de verdad sólo podemos escribir nosotros — es lo que
hace la apuesta sostenible.
