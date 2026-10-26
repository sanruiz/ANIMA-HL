---
applyTo: "**/components/**/*.tsx"
---
# React Component Standards

These are the shared core's conventions (`sanruiz-mall-frontend-starter`), which
ANIMA adopts so its architecture matches Antara's. See `CLAUDE.md`
(§ Component Structure & Naming) and the README's "Core compartido" section.

> **Status:** ANIMA's existing components do not comply yet (`PascalCase.tsx`
> files and `kebab/index.tsx` folders, all using `export default`). Conversion
> is planned separately. **New components follow these rules.**

## Component Structure

**✅ One flat file per component**, in kebab-case, inside a domain folder:

```
components/
├── ui/                     # shadcn primitives (installed via `npx shadcn add`)
│   ├── button.tsx
│   └── card.tsx
├── site/                   # the core's generic domain components
│   ├── entity-card.tsx
│   ├── entity-grid.tsx
│   └── page-state.tsx
└── anima/                  # the mall's own components
    └── brands-directory.tsx
```

**❌ NEVER**: `PascalCase.tsx`, nor a folder per component with `index.tsx`.

## Export Pattern

### Components: Named Export

```tsx
// ✅ CORRECT: src/components/site/entity-card.tsx
export function EntityCard({ href, title }: { href: string; title: string | null }) {
  return <a href={href}>{title}</a>;
}

// ❌ INCORRECT: default export
export default function EntityCard(/* … */) {}
```

A file may export **several components** when they are used together:

```tsx
// src/components/site/page-state.tsx
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-muted-foreground">{children}</p>;
}

export function ErrorState({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-destructive">{children}</p>;
}
```

### No barrel exports

There is no per-domain `index.ts`. Import by direct path:

```typescript
import { EntityCard } from "@/components/site/entity-card";
import { Button } from "@/components/ui/button";
```

### Non-Components: Named Exports

Helpers, types and hooks also use named exports, and live in `src/lib/`:

```typescript
// src/lib/types.ts
export type BrandNode = { /* … */ };

// src/lib/utils.ts
export function formatBrandHours(days: string | null, time: string | null): string { }
```

## Server vs Client Components

### Server Component (Default)

```tsx
// src/components/site/stats-card.tsx
import { getStats } from "@/data/stats";

interface StatsCardProps {
  title: string;
}

export async function StatsCard({ title }: StatsCardProps) {
  const stats = await getStats(); // Direct data fetching
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{stats.value}</p>
    </div>
  );
}
```

### Client Component (Interactive)

```tsx
// src/components/site/add-to-cart.tsx
"use client";

import { useState } from "react";

interface AddToCartProps {
  productId: string;
}

export function AddToCart({ productId }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <button onClick={() => setQuantity(q => q + 1)}>
      Add ({quantity})
    </button>
  );
}
```

## Props

Simple props are typed **inline in the signature**, the way the core does it.
Longer or reused shapes get an **exported** `type` in the same file — never a
separate per-component `types.ts`:

```tsx
// ✅ Inline for simple props
export function UserCard({ user, className }: { user: User; className?: string }) {
  return <div className={className}><h2>{user.name}</h2></div>;
}

// ✅ Exported type when the pages or sibling components reuse the shape
export type EntityCardTag = { name: string; slug: string };

export function EntityCard({ href, tags }: { href: string; tags?: EntityCardTag[] }) {
  // ...
}
```

## Test Placement

Colocated next to the component, named `<name>.test.tsx`. No `__tests__/`
subfolders:

```
components/site/entity-card.tsx
components/site/entity-card.test.tsx
```

## Hook Placement (CRITICAL)

**✅ ALL hooks MUST come BEFORE any conditional returns**:

```tsx
// ✅ CORRECT: Hooks first, then early returns
export function UserList({ users }: UserListProps) {
  const [filter, setFilter] = useState("");
  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.includes(filter)), 
    [users, filter]
  );

  // Early returns AFTER all hooks
  if (!users?.length) {
    return <p>No users found</p>;
  }

  return <ul>{/* ... */}</ul>;
}

// ❌ INCORRECT: Hook after conditional
export function UserList({ users }: UserListProps) {
  if (!users?.length) return null;  // ❌ Early return before hooks
  
  const [filter, setFilter] = useState("");  // ❌ Error!
  return <ul>{/* ... */}</ul>;
}
```

## Event Handlers

**✅ Use `handle` prefix** for event handlers:

```tsx
import type { ChangeEvent, SyntheticEvent } from "react";

export function Form() {
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
    </form>
  );
}
```
