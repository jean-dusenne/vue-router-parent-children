---
name: vue-workflow-structure
description: Organise Vue code by workflow (stock, refill, and any future workflow) instead of by technical type. Use when adding, moving, or reviewing Vue components, composables, Pinia stores, views, or routes of a workflow, when creating a new workflow, or when deciding whether code belongs in a workflow or in shared.
---

# Vue workflow structure

Code is grouped by **workflow** (a business flow with its own pages and routes). `stock` and `refill` are the current workflows; the list is not exhaustive and new workflows follow the same structure. Inside a workflow, the classic Vue folders are used. Code used by several workflows, or by a workflow and the app shell, lives in `shared/`.

The stock and refill code already follows this structure. Apply it to all **new code** and to code you are **touching**. `src/stores/counter.ts` is demo code tied to no workflow and is the only code left outside it.

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
  shared/              used by 2+ workflows, or a workflow and the app shell
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
| Any of the above used by 2+ workflows, or by a workflow and the app shell | `shared/components`, `shared/composables`, `shared/stores` |
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

Keep code in its workflow until a **second consumer actually needs it**: another workflow, or the app shell (`App.vue`, `src/router`). Do not put something in `shared/` because it looks generic.

When refill needs something that lives in stock:
1. Move it from `workflows/stock/<folder>/` to `shared/<folder>/`.
2. Update stock's imports to use `@/shared/...`.
3. Import it from `@/shared/...` in refill.

Never import from `@/workflows/stock/...` inside refill.

## Routes

Each workflow exports its routes and guards from `workflows/<workflow>/router/`. The app router aggregates them and may define only app-level routes that belong to no workflow, such as `/`.

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

## Examples from this repo

- `src/workflows/stock/router/stock-id-guard.ts` (`assertStockIdAllowed`) is stock-only, so it sits next to `src/workflows/stock/router/routes.ts`. `StockDetails.vue`, which also uses it, imports it relatively (`../router/stock-id-guard`).
- `src/shared/composables/useNavigationError.ts` records navigation errors (`router.onError` + `afterEach`). It lives in `shared/` because two consumers need it: `StockLayout.vue` (stock workflow) and `App.vue` (app shell, which shows the error when a direct load of `/stock/404` fails before any layout is mounted). It started in stock and was promoted when `App.vue` needed it.
- `src/workflows/stock/views/` holds `Stock*.vue`, `src/workflows/refill/views/` holds `Refill*.vue`; their routes are `stockRoutes` and `refillRoutes`, aggregated by `src/router/index.ts`.
- `src/stores/counter.ts` is demo code tied to no workflow. Leave it, or move it to `shared/stores/` only if two workflows use it.
