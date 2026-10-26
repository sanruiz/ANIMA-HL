# Claude Code Instructions

This file contains project-wide instructions for Claude Code.

## Agent Workflow for Complex Tasks

When implementing new features, refactoring code, or fixing complex issues, **always follow this systematic workflow**:

### Phase 1: Initial Analysis
1. **Analyze the request** - Understand the full scope, dependencies, and potential impacts
2. **Search existing code** - Use semantic search and grep to understand current implementation
3. **Identify components** - List all files, functions, and components that need changes
4. **Review documentation** - Check existing docs for patterns and conventions

### Phase 2: Planning Documentation
1. **Create planning document** - `docs/[feature-name]-plan.md` with:
   - Problem statement and objectives
   - Current architecture analysis
   - Proposed changes with before/after code examples
   - Risk assessment and mitigation strategies
   - Phase breakdown if complex
2. **Add action plan** - Detailed step-by-step implementation guide
3. **Create TODO list** - Use the TodoWrite tool to track all phases
4. **Commit planning** - `git commit -m "PROJECT-XXX: Add [feature] implementation plan"`

### Phase 3: Implementation by Phases
For each phase:
1. **Mark TODO as in-progress** - Update status before starting work
2. **Implement changes** - Make code changes following the plan
3. **Write/update tests** - Add unit tests, ensure regression tests pass
4. **Run tests** - `npm test` to verify no regressions
5. **Mark TODO as completed** - Update status after successful implementation
6. **Commit phase** - `git commit -m "PROJECT-XXX: Implement [feature] - Phase N"`

### Phase 4: Final Documentation
1. **Create final documentation** - `docs/[feature-name].md`
2. **Update related docs** - Update `project-overview.md`, `readme.md`, etc.
3. **Delete planning docs** - Remove temporary planning documents
4. **Final commit** - `git commit -m "PROJECT-XXX: Add [feature] documentation"`

### Key Principles
- ✅ **One commit per phase** - Create clear checkpoint commits
- ✅ **Test everything** - Run full test suite after each phase
- ✅ **No breaking changes** - Ensure backward compatibility
- ✅ **Document as you go** - Update docs with each phase
- ✅ **Type safety** - Maintain full TypeScript coverage

## Slash Commands

Custom slash commands are available in `.claude/commands/`:

| Command | Description |
|---------|-------------|
| `/analyze-github-issue` | Analyze a GitHub issue without making changes |
| `/create-plan` | Create an implementation plan for an issue |
| `/work-github-issue` | Start working on a GitHub issue with full workflow setup |
| `/prepare-pr` | Prepare code for pull request review |
| `/create-github-pr` | Create and submit a pull request |
| `/finalize-github-pr` | Finalize and merge a pull request |
| `/prepare-github-release` | Bump the version, update the changelog and tag a release |
| `/review-code` | Review code for quality and issues |
| `/fix-issues` | Fix identified code issues |
| `/add-tests` | Add tests for existing code |
| `/audit-ai-seo` | Audit the site for AI/generative search optimization |

## Key Technologies & Frameworks

- **Next.js 16.x** with App Router for modern React development
- **React 19** for latest React features and optimizations
- **TypeScript** for comprehensive type safety
- **Tailwind CSS v4** with custom CSS variables and shadcn/ui design system
- **Vitest & React Testing Library** for comprehensive testing (`npm test`
  runs `vitest run`; there is no Jest in this repo, despite what older notes
  said — the shared core uses the same runner and version)

## Domain-Driven Design (DDD) Principles

This project follows **Domain-Driven Design** principles.

**Core Principles**:
1. **Group by Domain, Not by Type** - Organize files by business domain rather than technical type
2. **Clear Boundaries** - Each domain has well-defined responsibilities
3. **Colocation** - Related code (components, utils, tests) lives together

**Quick Rules**:
- ✅ Create domain folders that match business concepts
- ✅ Keep domain-specific utilities inside domain folders
- ✅ Colocate tests next to the file they cover (`entity-card.test.tsx`)
- ❌ Don't create generic folders like "helpers", "services", "utils" at root level

## Key Conventions

### Code Style & Organization

- **Imports**: Always organize imports alphabetically within each group
- **API Functions**: Must have descriptive JSDoc comments in English
- **Types**: Define interfaces and types properly, not directly in components
- **No `any` Type**: Always define explicit types using `type` or `interface`
- **File Naming**: All files should use kebab-case (e.g., `use-hash.ts`, `contact-form.tsx`)
- **Object Destructuring**: Always use destructuring when iterating over objects
- **Error Handling**: Apply robust error handling with try/catch for async operations
- **Import Paths**: Always use absolute imports with `@/` prefix

### Component Structure & Naming

**These are the shared core's conventions (`sanruiz-mall-frontend-starter`).**
ANIMA adopts them so its architecture matches Antara's and the core can be
extracted as a package.

> ⚠️ **Precedence.** Two skills vendored from `@silverassist/agents-toolkit` —
> `component-architecture` and `domain-driven-design` — still teach the
> opposite (`<folder>/index.tsx`, `export default`, barrel `index.ts`). They
> are package-managed and hash-tracked in `agents-toolkit-lock.json`, so they
> are not edited here: **for this repo's components, this section wins** over
> those skills. The fix belongs upstream in the toolkit.

> **Status:** every component complies. The 40 that predated the convention
> were converted in one mechanical pass (`430083d`) — flat `kebab-case.tsx`
> under `src/components/anima/`, named exports, tests colocated.

#### 1. Folder & File Naming

- **One flat file per component**, named in kebab-case: `entity-card.tsx`
- Grouped in a domain folder: `ui/` (shadcn primitives), `site/` (the core's
  generic domain components), or the mall's own domain (`anima/`)
- **❌ NEVER**: `PascalCase.tsx`, nor a folder per component with `index.tsx`

```
✅ CORRECT:
src/components/ui/button.tsx
src/components/site/entity-card.tsx
src/components/anima/brands-directory.tsx

❌ INCORRECT:
src/components/BrandsDirectory.tsx
src/components/brands-directory/index.tsx
```

#### 2. Component Export Pattern

- **Function name**: PascalCase
- **Export statement**: named `export function`, NOT `export default`
- **No barrel `index.ts`** — import by direct path
- A file may export **several components** when they are used together
  (e.g. `page-state.tsx` exports `EmptyState` and `ErrorState`)

```tsx
// ✅ CORRECT: src/components/site/entity-card.tsx
export type EntityCardTag = { name: string; slug: string };

/**
 * Generic list-item card for any content type. Domain pages map their own
 * field shape into these props.
 */
export function EntityCard({ href, title, tags }: {
  href: string;
  title: string | null;
  tags?: EntityCardTag[];
}) {
  // ...
}

// Usage
import { EntityCard } from "@/components/site/entity-card";
```

#### 3. Props Definition

- **Simple props**: typed inline in the signature (see the example above)
- **Shared types** — reused across components or by the pages — are exported
  with `export type` from the same file
- Generic components carry JSDoc explaining what they abstract

#### 4. Separation of Concerns

- **Helpers and hooks**: in `src/lib/` with named exports, not inside the component
- **Domain types**: in `src/lib/types.ts` (the WPGraphQL contract)
- **Shared constants**: in `src/lib/`, not duplicated per component

#### 5. Tests

Colocated next to the file they cover, named `<name>.test.ts(x)` — the core's
layout: `src/lib/wp.test.ts`, `src/components/site/entity-card.test.tsx`. No
`__tests__/` subfolders.

---

## React Patterns

### Hook Placement Rules (CRITICAL)

**✅ Correct:** All hooks before conditional returns

```typescript
export function Component({ data }: Props) {
  const [state, setState] = useState(initialState);
  const handleClick = useCallback(() => {}, []);

  // Early returns AFTER all hooks
  if (!data) return null;
  
  return <div>...</div>;
}
```

**❌ Incorrect:** Hooks after conditional returns

```typescript
export function Component({ data }: Props) {
  if (!data) return null; // ❌ Early return before hooks
  
  const [state, setState] = useState(initialState); // ❌ Error!
  return <div>...</div>;
}
```

---

## Git Commit Guidelines

### Commit Message Format

```
TYPE-XXX: Brief description

- Detailed change 1
- Detailed change 2
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Branch Naming

- `feature/TYPE-XXX-brief-description`
- `bugfix/TYPE-XXX-brief-description`
- `hotfix/TYPE-XXX-brief-description`

---

## Agent tooling — this repo no longer syncs with `@silverassist/agents-toolkit`

`.agents/skills/`, `.github/instructions/`, `.github/prompts/`,
`.claude/commands/` and `.github/hooks/` started as toolkit templates and have
since diverged — the component convention above is ours, not the toolkit's.
**Do not run `npx @silverassist/agents-toolkit restore` (or any sync) in this
repo:** it templates `CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`, the
instructions, the prompts and the `validate-tsx` hook, has no managed-block
markers to merge around local edits, and would revert them.

The vendoring lock is gone and the skills are committed, so what you see here is
what the agents get. `.agents-toolkit.json` stays — it is now plain repo config
(base branch, tracker) that ten of the commands read to resolve `BASE_BRANCH`,
and removing it would silently send PRs at `main` instead of `master`.

This tooling is now independent of the shared core. Skills live in the core
repo and serve whoever develops it — they are not distributed to the malls, so
there is nothing here to sync.

Both Claude Code and Copilot are in use, so anything we add has to land in
`.claude/` and `.github/` alike. `.github/skills/*` are symlinks into
`.agents/skills/` — keep that shape when adding a skill.

---

## Shared Detailed Rules (source of truth for both Claude & Copilot)

The following files under `.github/instructions/` contain detailed coding
conventions written in Copilot's `applyTo` format but agent-agnostic in content.
Read the relevant file BEFORE touching a matching path — do not duplicate the
rules into memory, treat these as the canonical source.

| File | Read when touching |
|---|---|
| [.github/instructions/typescript.instructions.md](.github/instructions/typescript.instructions.md) | Any `*.ts` / `*.tsx` |
| [.github/instructions/react-components.instructions.md](.github/instructions/react-components.instructions.md) | `src/components/**/*.tsx` |
| [.github/instructions/server-actions.instructions.md](.github/instructions/server-actions.instructions.md) | `src/app/actions/**/*.ts` |
| [.github/instructions/tests.instructions.md](.github/instructions/tests.instructions.md) | `*.test.{ts,tsx}` |
| [.github/instructions/caching.instructions.md](.github/instructions/caching.instructions.md) | `next.config.*`, `src/proxy.ts`, `src/lib/**/*.ts`, `src/app/**/{route,page}.tsx` |
| [.github/instructions/seo-ai-optimization.instructions.md](.github/instructions/seo-ai-optimization.instructions.md) | Any `*.tsx` (pages, layouts, metadata) |
| [.github/instructions/css-styling.instructions.md](.github/instructions/css-styling.instructions.md) | `*.css` / `*.tsx` — **see CSS exception below** |

### CSS styling — exception for Webflow-migrated sections

`css-styling.instructions.md` prescribes Tailwind + shadcn/ui + mobile-first as
the default for new UI. **Full-bleed sections migrated from Webflow** (currently
Home, About, Footer, Brands) intentionally break that rule and use **BEM classes
in `src/app/globals.css`** with CSS custom properties (`--color-oscuro`,
`--color-beige`, etc.) and **desktop-first media queries** (`@media (max-width: 991px)`).
Reason: the migration mirrors Webflow's output verbatim to keep visual parity
during the WordPress-headless transition.

### Hybrid rule (BEM ↔ Tailwind) — the split is inside each section

Even within a Webflow-migrated section, split at the boundary of "canvas" vs
"interactive/repeatable content":

- **BEM in `globals.css`** for the section canvas: full-bleed hero, art-direction
  strips (essence, closing), section title + lead paragraphs, complex layered
  backgrounds (image + gradient + centered text). These pieces mirror Webflow
  1:1, need exact desktop-first breakpoints (991 / 767), and rarely change.
- **Tailwind utilities (+ shadcn primitives when applicable)** for anything
  interactive or repeated inside the canvas: filter tabs, cards, grids, buttons,
  forms, modals. Rule of thumb: if it has state (hover/focus/active) OR renders
  as a list of N items, it's Tailwind. Use `cn()` from `@/lib/utils`, semantic
  tokens (`bg-brand-oscuro`, `text-brand-oscuro/70`), and mobile-first breakpoints.

**Example (Brands page):**

- BEM → `.brands-hero`, `.brands-intro`, `.brands-directory` (wrapper),
  `.brands-directory__intro` (Retail Reimagined heading + lead).
- Tailwind → filter buttons, grid, brand cards inside `BrandsDirectory`.

### What was removed, and why there is no longer a "does not apply" list

`php-standards`, `wordpress-plugin-architecture`, `testing-standards` (PHPUnit),
`github-workflow` and `documentation-language` were seeded from a Silver Assist
WordPress plugin template and are **deleted** — 1256 lines describing a stack
this repo does not have. They were not inert: each carried `applyTo: "**"`, so
`github-workflow` was asserting `main` as the base branch (this repo uses
`master`) and `documentation-language` an English-only rule (`docs/` is in
Spanish).

Deleted alongside them: the `create-component`, `plugin-creation`,
`quality-checks`, `release-management` and `testing` skills (all PHP/WordPress),
the `new-wp-component`, `new-wp-plugin`, `prepare-release` and `quality-check`
prompts, and the Jira twins `analyze-ticket`, `work-ticket`, `create-pr` and
`finalize-pr` — this repo's tracker is GitHub, and each has a `*-github-*`
counterpart that stays.

Everything listed in the table above is what remains, and all of it applies.
