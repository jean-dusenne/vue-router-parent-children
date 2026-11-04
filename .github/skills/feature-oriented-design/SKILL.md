---
name: feature-oriented-design
description: Use when deciding where Vue code belongs, creating a workflow or feature, placing components, composables, stores, API calls or routes, or resolving imports between features or workflows in a Vue 3 project.
---

# Feature-Oriented Design (Vue)

Organize by business capability, not by technical type. Source of truth for code placement in this project.

Two business levels: a **workflow** groups related **features**. A feature is one business capability with its own views. A workflow is a namespace with a public entry point, a parent layout and optional shared code. It is not a technical container.

## Structure

```text
src/
  app/                    # bootstrap, router, providers, workflow composition
  core/                   # shared by ALL workflows: utilities, pure domain logic, app-wide context
    components/ composables/ utils/ api/ config/ domain/ stores/
  workflows/<workflow>/
    index.ts              # the only public entry point of the workflow
    layout/               # parent route component(s) of the workflow
    shared/               # optional: code shared by 2+ features of this workflow
      components/ composables/ model/
    features/<feature>/
      api/ components/ composables/ stores/ views/ model/
      index.ts            # the only public entry point of the feature
```

Technical segments (`api/`, `components/`, `stores/`...) live at feature level only. Never replicate them at workflow level; `workflows/<workflow>/shared/` is the only exception and is created only when needed. Create only the segments a feature needs.

Do not create `features/` until there are 2+ business capabilities. Do not create `workflows/` until there are 2+ workflows each owning (or about to own) several features. Below that, use the simpler layout (flat `views/`, `composables/`, `services/`, or `features/<feature>/` directly under `src/`); migrate when the second level is justified.

## Import rules

| From | May import |
|------|-----------|
| `app` | `core`, any workflow via its `index.ts` |
| `workflows/w/layout` | `core`, `w/shared`, `w` features via their `index.ts` |
| `workflows/w/shared` | `core` only |
| `workflows/w/features/x` | `core`, `w/shared`, its own files, another feature of the same workflow via its `index.ts`, another workflow via its `index.ts` |
| `core` | `core` only |

A feature may use another feature's exported stores, composables and types directly. Import through its `index.ts`, never its internal files. Across workflows, import only through the workflow's `index.ts`, never a feature of another workflow. No circular dependencies between features or between workflows: dependencies between workflows are one-directional (e.g. `refill -> stock`). A mutual dependency means the shared code belongs in `core/` (if generic) or that both are one workflow.

A feature's `index.ts` exports `<feature>Routes` and the stores, composables and types needed by consumers. A workflow's `index.ts` exports `<workflow>Routes` and re-exports only what other workflows consume. Do not create wrappers just to hide a Pinia store. Neither re-exports views or components: static re-exports eagerly load them and undermine lazy routes.

Enforce import boundaries with lint: `no-restricted-imports` overrides in `eslint.config.mjs` block deep imports into a feature from outside its workflow, deep imports into a workflow, `features -> app` and `core -> workflows/app`. Imports through `index.ts` are allowed. Inside a feature or workflow, import own files with relative paths, not `@/workflows/<self>`. Check for circular dependencies when adding a feature or workflow dependency.

## Placement

**Start in the feature. Sharing does not mean moving to `core/`.** Share at the narrowest level that has 2+ real consumers: feature, then `workflows/<w>/shared/`, then `core/`.

| Code to place | Location |
|---------------|----------|
| A feature's state, actions, API calls or business UI | That feature |
| Parent layout of a workflow's routes | `workflows/<w>/layout/` |
| Generic UI or composables used by 2+ features of the same workflow | `workflows/<w>/shared/` |
| Session identity, language or theme shared across the app | `core/stores/`: data and simple setters only |
| Generic UI or utilities actually used by 2+ workflows | `core/components/`, `core/composables/`, `core/utils/`, etc. |
| Pure business rules or types actually used by 2+ workflows | `core/domain/`: no Vue, Pinia, API calls or state |
| Using another feature's store or composable (same workflow) | Import it directly through that feature's `index.ts` |
| Using another workflow's store or composable | Import it through that workflow's `index.ts` (one-directional) |
| Bootstrap, router and application-level composition | `app/` |

**When checkout needs cart (same `shop` workflow):** keep the store in the cart feature, export `useCartStore` from cart's `index.ts`, then call it directly in checkout. No relay through `app/`, props or `provide`/`inject` is required.

```ts
// workflows/shop/features/checkout/...
import { useCartStore } from '../cart'

const cart = useCartStore()
```

From another workflow, import through the workflow's entry point instead: `import { useCartStore } from '@/workflows/shop'`.

Call stores inside component setup, composables or store actions, not at module scope. Use `storeToRefs()` when destructuring state or getters.

`core/stores/` is not a home for shared feature stores. Its setters only replace or clear data; API calls, validation, calculations and workflows stay in features. `app/` defines no stores or state of its own.

Check VueUse before writing a shared composable.

Routes: each feature exports a `<feature>Routes` array (child routes) with lazy `component: () => import(...)` from its `index.ts`. The workflow composes them under its lazy parent layout and exports `<workflow>Routes` from its `index.ts`; `app/router` assembles the workflows. Route guards and other business logic of a route stay in the feature that owns it, never in `app/router`.

```ts
// workflows/refill/index.ts
import { overviewRoutes } from './features/overview'
import { settingsRoutes } from './features/settings'

export const refillRoutes = [
  {
    path: '/refill',
    component: () => import('./layout/RefillLayout.vue'),
    children: [...overviewRoutes, ...settingsRoutes],
  },
]
```

Do not merge features just to share state. Merge only when they represent the same business capability.

## Segments

- `views/`: route-level components. `components/`: feature-internal UI.
- `composables/`: reactive logic and VueUse wrappers. `stores/`: Pinia.
- `api/`: requests and their DTOs. `model/`: types and pure logic.
- Name files by domain (`building-task.ts`, `fetch-building-counts.ts`), never `types.ts`, `utils.ts`, `helpers.ts`.
- Store: `stores/<domain>-store.ts` exporting `use<Domain>Store`.
- Both a feature and `core/` may contain multiple stores. Each store has one coherent responsibility; do not combine unrelated state to enforce one store per feature, or create a store per component. Keep component-local state in the component.
- Tests: co-located with the code, `<file>.spec.ts` next to `<file>.ts`.

## Concrete examples

| I need to... | Do this |
|--------------|---------|
| Store cart items, add an item, calculate the cart total | Put the store and actions in `workflows/shop/features/cart/stores/cart-store.ts` |
| Use cart items or actions in checkout (same workflow) | Import `useCartStore` from `../cart` and use it directly |
| Display the current user's name in several features | Store session identity in `core/stores/session-store.ts`; each feature reads it directly |
| Show stock data inside refill | Export the store from `workflows/stock/index.ts`; import it in a refill feature. Never import a stock feature directly, and stock must not import refill |
| Two refill features need the same component | Put it in `workflows/refill/shared/components/` |
| Log in or log out | Implement the API calls and workflow in an `auth` feature (or workflow); update or clear the shared session data there |
| Change the language or theme | Use a data-only store in `core/stores/` |
| Reuse a component currently used by only one feature | Keep it in that feature until a real second consumer exists |

Use `stores/` everywhere for Pinia directories; the folder name does not limit the number of stores. Do not add `entities/`, `widgets/` or `pages/` layers.
