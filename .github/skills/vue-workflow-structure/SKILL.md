---
name: vue-workflow-structure
description: Organise Vue code by workflow (stock, refill, and any future workflow) instead of by technical type. Use when adding, moving, or reviewing Vue components, composables, Pinia stores, views, or routes of a workflow, when creating a new workflow, or when deciding whether code belongs in a workflow or in shared.
---

# Vue workflow structure

Code is grouped by **workflow** (a business flow with its own pages and routes). `stock` and `refill` are the current workflows; the list is not exhaustive and new workflows follow the same structure. Inside a workflow, the classic Vue folders are used. Code used by several workflows lives in `shared/`.

Existing code (`src/views`, `src/router/stock-id-guard.ts`, ...) is migrated to this structure by a later change. Apply the structure to all **new code** and to code you are **touching**; do not move unrelated files.

## Target structure

```
src/
  workflows/
    stock/
      components/      building blocks used by stock views
      composables/     use*.ts
      stores/          Pinia stores
      views/           pages and layouts mounted by routes
      router/          routes.ts (+ guards)
    refill/
      components/  composables/  stores/  views/  router/
    <new-workflow>/    same structure
  shared/              used by 2+ workflows
    components/  composables/  stores/
  router/index.ts      creates the router, aggregates workflow routes
  App.vue
  main.ts
```

Create a folder only when it contains something. A workflow without state has no `stores/`.

## Where does it go?

| Kind of code | Folder |
| --- | --- |
| Page or layout mounted by a route (`*Layout.vue`, `*Details.vue`) | `workflows/<workflow>/views/` |
| Non-routed component | `workflows/<workflow>/components/` |
| `use*` function (reactive logic, router hooks) | `workflows/<workflow>/composables/` |
| Pinia store | `workflows/<workflow>/stores/` |
| Routes and route guards of the workflow | `workflows/<workflow>/router/` |
| Any of the above used by 2+ workflows | `shared/components`, `shared/composables`, `shared/stores` |
| Router creation, app-level routes (`/`) | `src/router/index.ts` |

## Dependency rules

```
stock  --->  shared  <---  refill
stock  -x->  refill        (never import another workflow)
shared -x->  any workflow  (shared never depends on a workflow)
```

- A workflow may import from `shared/`.
- A workflow must not import from another workflow.
- `shared/` must not import from a workflow.

## Promotion to shared

Keep code in its workflow until a **second workflow actually needs it**. Do not put something in `shared/` because it looks generic.

When refill needs something that lives in stock:
1. Move it from `workflows/stock/<folder>/` to `shared/<folder>/`.
2. Update stock's imports to use `@/shared/...`.
3. Import it from `@/shared/...` in refill.

Never import from `@/workflows/stock/...` inside refill.

## Routes

Each workflow exports its routes and guards from `workflows/<workflow>/router/`. The app router only aggregates them.

```ts
// src/workflows/stock/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { assertStockIdAllowed } from './stock-id-guard'

export const stockRoutes: RouteRecordRaw[] = [
  {
    path: '/stock',
    component: () => import('../views/StockLayout.vue'),
    children: [
      { path: '', component: () => import('../views/StockDirectory.vue'), meta: { title: 'Stock' } },
      {
        path: ':id',
        component: () => import('../views/StockDetails.vue'),
        props: true,
        beforeEnter: (to) => assertStockIdAllowed(to.params.id),
        meta: { title: 'Stock details' },
      },
    ],
  },
]
```

```ts
// src/router/index.ts
import { stockRoutes } from '@/workflows/stock/router/routes'
import { refillRoutes } from '@/workflows/refill/router/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', component: EmptyRoute, meta: { title: 'Vue Router POC' } }, ...stockRoutes, ...refillRoutes],
})
```

Adding a route to a workflow means editing that workflow's routes only.

## Adding a new workflow

1. Create `src/workflows/<new-workflow>/` with only the folders it needs.
2. Export its routes from `src/workflows/<new-workflow>/router/routes.ts`.
3. Spread them into `src/router/index.ts`.
4. Apply the same dependency and promotion rules: no import from other workflows, shared code goes to `shared/`.

## Imports

- Across layers: use the `@/` alias, for example `@/shared/composables/useX`.
- Within the same workflow: use relative paths, so the workflow can be moved as a unit.
- No barrel `index.ts` per workflow for now.

## Examples from this repo (target state)

Current paths below exist today; the destination is the target.

- `src/router/stock-id-guard.ts` (`assertStockIdAllowed`) is stock-only. It moves to `src/workflows/stock/router/stock-id-guard.ts`, next to the stock routes. `StockDetails.vue`, which also uses it, imports it relatively.
- `src/views/StockLayout.vue` contains navigation-error logic (`router.onError` + `afterEach`). Extract it as `useNavigationError` in `src/workflows/stock/composables/`. `src/views/RefillLayout.vue` does not use it, so it stays in stock. If refill later needs it, promote it to `src/shared/composables/useNavigationError.ts`.
- `src/views/Stock*.vue` go to `src/workflows/stock/views/`, `src/views/Refill*.vue` to `src/workflows/refill/views/`.
- `src/stores/counter.ts` is demo code tied to no workflow. Leave it, or move it to `shared/stores/` only if two workflows use it.
