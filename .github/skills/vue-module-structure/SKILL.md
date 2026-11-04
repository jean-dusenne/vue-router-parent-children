---
name: vue-module-structure
description: Organise Vue code by bounded application module (stock, refill, and future modules) rather than by technical type. Use when adding, moving, or reviewing Vue components, composables, Pinia stores, views, or routes, when creating a module, or when deciding whether code belongs in a module or in shared.
---

# Vue module structure

The application is organised by **module**: a bounded area with its own URL prefix, top-level layout, and routes. `stock` and `refill` are the current modules; new modules follow the same structure. A step-by-step business workflow is a concept inside a module, not a reason to create a new root folder. Code used by multiple modules or by a module and the app shell lives in `shared/`.

The stock and refill code already follows this structure. Apply it to new code and to code you touch. `src/stores/counter.ts` is demo code unrelated to a module and is the only code left outside this structure.

## Target structure

```
src/
  modules/
    stock/
      index.ts          public module entry point
      components/       building blocks used by stock views
      composables/      use*.ts
      stores/           Pinia stores
      views/            pages and layouts mounted by routes
      router/           routes.ts (+ guards)
      inventory/        optional module subdomain
    refill/
      index.ts  components/  composables/  stores/  views/  router/
  shared/               used by 2+ modules, or a module and the app shell
    components/  composables/  stores/
  router/index.ts       creates the router, aggregates module routes
  App.vue
  main.ts
```

Create a folder only when it contains something. A module without state has no `stores/`. Add subdomain folders inside a module only when its size or domain structure calls for them.

## Where does it go?

| Kind of code | Folder |
| --- | --- |
| Page or layout mounted by a route (`*Layout.vue`, `*Details.vue`) | `modules/<module>/views/` |
| Non-routed component | `modules/<module>/components/` |
| `use*` function (reactive logic, router hooks) | `modules/<module>/composables/` |
| Pinia store | `modules/<module>/stores/` |
| Routes and route guards of a module | `modules/<module>/router/` |
| Subdomain or stepwise workflow | `modules/<module>/<subdomain>/` |
| Any of the above used by 2+ modules, or by a module and the app shell | `shared/components`, `shared/composables`, `shared/stores` |
| Router creation, app-level routes (`/`) | `src/router/index.ts` |

## Dependency rules

```
stock  --->  shared  <---  refill
    \           ^           /
     \---- app router ------/
stock  -x->  refill        (modules never import one another)
shared -x->  any module     (shared never depends on a module)
```

- A module may import from `shared/`.
- A module must not import from another module.
- `shared/` must not import from a module.
- The app router composes modules through their public entry points.

## Promotion to shared

Keep code in its module until a **second consumer actually needs it**: another module, or the app shell (`App.vue`, `src/router`). Do not put something in `shared/` because it looks generic.

When refill needs something that lives in stock:
1. Move it from `modules/stock/<folder>/` to `shared/<folder>/`.
2. Update stock's imports to use `@/shared/...`.
3. Import it from `@/shared/...` in refill.

Never import from `@/modules/stock/...` inside refill. The application router may use a module's public entry point, but peer modules remain independent.

## Module entry points and routes

Each module owns its route definitions and guards under `modules/<module>/router/`. Its root `index.ts` exports the supported module surface needed by the app router. The root router aggregates those exports and may define only app-level routes that belong to no module, such as `/`.

```ts
// src/modules/stock/index.ts
export { stockRoutes } from './router/routes'
```

```ts
// src/router/index.ts
import { stockRoutes } from '@/modules/stock'
import { refillRoutes } from '@/modules/refill'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', component: EmptyRoute, meta: { title: 'Vue Router POC' } }, ...stockRoutes, ...refillRoutes],
})
```

Route components can remain lazy-loaded by their route records. A future module loader or package boundary can build on the module entry point, but it is not required for ordinary route changes.

Adding a route to a module means editing that module's routes; the root router only needs a change when registering a new module.

## Adding a new module

1. Create `src/modules/<new-module>/` with only the folders it needs.
2. Add its routes and guards under `src/modules/<new-module>/router/`.
3. Export the module's supported app-level surface from `src/modules/<new-module>/index.ts`.
4. Import that public export and aggregate its routes in `src/router/index.ts`.
5. Apply the dependency and promotion rules: no imports from other modules; reusable code belongs in `shared/`.

## Imports

- Across modules and shared layers, use the `@/` alias, for example `@/shared/composables/useX`.
- Within the same module, use relative paths so the module can move as a unit.
- The app router imports a module through its public entry point, for example `@/modules/stock`.
- Keep one module-level `index.ts` as the public entry point; do not add barrel files to every internal folder.

## Examples from this repo

- `src/modules/stock/router/stock-id-guard.ts` (`assertStockIdAllowed`) is stock-only, so it sits next to `src/modules/stock/router/routes.ts`. `StockDetails.vue`, which also uses it, imports it relatively (`../router/stock-id-guard`).
- `src/shared/composables/useNavigationError.ts` records navigation errors (`router.onError` + `afterEach`). It lives in `shared/` because two consumers need it: `StockLayout.vue` (stock module) and `App.vue` (app shell, which shows the error when a direct load of `/stock/404` fails before any layout is mounted). It started in stock and was promoted when `App.vue` needed it.
- `src/modules/stock/views/` holds `Stock*.vue`, and `src/modules/refill/views/` holds `Refill*.vue`; their routes are `stockRoutes` and `refillRoutes`, exposed through their module entries and aggregated by `src/router/index.ts`.
- A future stock inventory workflow can live under `src/modules/stock/inventory/`; it does not become a root-level module merely because it has multiple steps.
- `src/stores/counter.ts` is demo code unrelated to a module. Leave it, or move it to `shared/stores/` only if multiple modules use it.
