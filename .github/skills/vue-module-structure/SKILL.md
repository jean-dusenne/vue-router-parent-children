---
name: vue-module-structure
description: Organise Vue code by bounded application module rather than by technical type. Use when adding, moving, or reviewing Vue components, composables, Pinia stores, views, or routes, when creating a module, or when deciding whether code belongs in a module or in shared.
---

# Vue module structure

The application is organised by **module**: a bounded area with its own URL prefix, top-level layout, and routes. This skill uses `stock` and `refill` as example modules; every module follows the same structure. A step-by-step business workflow is a concept inside a module, not a reason to create a new root folder. Code used by multiple modules or by a module and the app shell lives in `shared/`.

Apply this structure to new code and to code you touch.

## Target structure

```
src/
  modules/
    stock/
      index.ts          public module entry point
      components/       building blocks used by stock views
      composables/      use*.ts
      stores/           Pinia stores
      services/         non-reactive logic, API clients
      models/           types and domain models
      views/            pages and layouts mounted by routes
      router/           routes.ts (+ guards)
      inventory/        optional module subdomain
    refill/
      index.ts  components/  composables/  stores/  views/  router/
  shared/               used by 2+ modules, or a module and the app shell
    components/  composables/  stores/  services/  models/
  router/index.ts       creates the router, aggregates module routes
  App.vue
  main.ts
```

These folders are common examples, not a closed list: add another folder for a new kind of code, with the same name in a module and in `shared/`. Create a folder only when it contains something. A module without state has no `stores/`. Add subdomain folders inside a module only when its size or domain structure calls for them.

A subdomain reuses the module's folder names for what it needs, for example `inventory/components/` and `inventory/views/`. It stays part of the module: it uses relative imports, and its routes stay in the module's `router/`.

## Where does it go?

| Kind of code | Folder |
| --- | --- |
| Page or layout mounted by a route (`*Layout.vue`, `*Details.vue`) | `modules/<module>/views/` |
| Non-routed component | `modules/<module>/components/` |
| `use*` function (reactive logic, router hooks) | `modules/<module>/composables/` |
| Pinia store | `modules/<module>/stores/` |
| Non-reactive logic, API client | `modules/<module>/services/` |
| Types and domain models | `modules/<module>/models/` |
| Routes and route guards of a module | `modules/<module>/router/` |
| Subdomain or stepwise workflow | `modules/<module>/<subdomain>/` |
| Reusable code used by 2+ modules, or by a module and the app shell | `shared/<folder>/`, chosen by kind of code |
| Tests of a module or of shared code | Inside that module or `shared/`, in a `__tests__/` folder or next to the code, as the team prefers |
| Tests of the app shell or of module composition | `src/__tests__/` |
| Router creation, app-level routes (`/`) | `src/router/index.ts` |

## Dependency rules

```
app shell  --->  module        (public entry point only)
app shell  --->  shared
module     --->  shared
module     -x->  other module  (modules never import one another)
module     -x->  app shell
shared     -x->  module        (shared never depends on a module)
shared     -x->  app shell
```

The app shell is `main.ts`, `App.vue`, and `src/router`. A module must not depend on how it is deployed, so it does not import `appModule` or read `VITE_APP_MODULE`.

## Runtime isolation

Import rules do not isolate modules at runtime. Deployed together, modules share one router, one Pinia instance, and the global CSS, so a collision appears only in the whole app, not when a module is served alone.

- Prefix route names with the module name, for example `stock-details`.
- Prefix Pinia store ids with the module name, for example `defineStore('stock-filters', ...)`.
- Use `<style scoped>` for module styles.

## Promotion to shared

Keep code in its module until a **second consumer actually needs it**: another module, or the app shell (`main.ts`, `App.vue`, `src/router`). Do not put something in `shared/` because it looks generic.

When refill needs something that lives in stock:
1. Move it to the `shared/` folder that matches its kind of code, usually the same folder name as in the module. For example, logic extracted from a guard goes to `shared/services/`, not `shared/router/`.
2. Check what it imports from stock, because `shared/` must not import from a module. Move that code to `shared/` too if both modules need it; otherwise keep it in stock and pass it as a parameter.
3. Make it generic: remove stock-specific names and behavior. A promoted store takes the `shared-` prefix, for example `stock-filters` becomes `shared-filters`.
4. Update stock's imports to use `@/shared/...`.
5. Import it from `@/shared/...` in refill.

Views, routes, guards, and subdomains stay in their module. If a second consumer needs part of one, extract that part and promote it.

## Module entry points and routes

Each module owns its route definitions and guards under `modules/<module>/router/`. Its root `index.ts` exports the supported module surface needed by the app router. The root router aggregates those exports and may define only app-level routes that belong to no module, such as `/`.

```ts
// src/modules/stock/index.ts
export { createStockRoutes } from './router/routes'
```

Each module exports a route factory, not a static route array. The prefix is chosen by the app router: the default prefix when modules are deployed together, an empty one when the module is served alone.

```ts
// src/modules/<module>/router/routes.ts
export const createXRoutes = (prefix = '/x'): RouteRecordRaw[] => [
  {
    path: prefix || '/',
    component: () => import('../views/XLayout.vue'),
    children: [
      { path: '', name: 'x-overview', component: () => import('../views/XOverview.vue') },
      { path: ':id', name: 'x-details', component: () => import('../views/XDetails.vue') },
    ],
  },
]
```

- The default prefix is the module's URL prefix, for example `/stock`.
- Use `prefix || '/'` for the top-level path: an empty prefix must resolve to `/`.
- Declare every module route as a child of this top-level route.
- Keep child paths relative, with no leading `/`: an absolute child path ignores the prefix.

`src/router/index.ts` imports each route factory from the module's entry point. When `VITE_APP_MODULE` is set, `buildRoutes` mounts that module alone at `/` with an empty prefix; otherwise it aggregates all modules with their default prefixes and the app-level routes.

Route components can remain lazy-loaded by their route records.

Adding a route to a module means editing that module's routes; the root router only needs a change when registering a new module.

## Navigation

Inside a module, target routes by name, never by path, in both `RouterLink` and `router.push` or `router.replace`. The URL depends on the prefix chosen at build time: the same route is `/stock/42` in the whole app and `/42` when stock is served alone.

```vue
<RouterLink :to="{ name: 'stock-details', params: { id: 42 } }">Stock 42</RouterLink>
```

A module must not link to another module's routes, by path or by route name, because those routes do not exist when it is served alone. Navigation between modules belongs to the app shell and only exists when several modules are deployed together. Do not add a link to a new module in the app shell unless the project asks for it.

## Adding a new module

1. Create `src/modules/<new-module>/` with only the folders it needs.
2. Add its route factory and guards under `src/modules/<new-module>/router/`, following the route factory contract above.
3. Export the module's supported app-level surface from `src/modules/<new-module>/index.ts`.
4. Import that public export and aggregate its routes in `src/router/index.ts`, with a standalone branch in `buildRoutes`, and add the module name to `env.d.ts`.
5. If the project uses per-module scripts, add `dev:<new-module>`, `build:<new-module>`, and `serve:<new-module>` to `package.json`.
6. If the project uses editor workspaces, add `<new-module>.code-workspace`, which hides the other modules, and hide the new module in the existing workspaces.
7. List the module and its build and serve commands in the project documentation.
8. Add tests: route resolution with the default and empty prefixes, and a standalone build that contains only this module. Update the standalone build tests of the existing modules so they also exclude it.
9. Apply the dependency and promotion rules: no imports from other modules; reusable code belongs in `shared/`.

## Imports

- To import from `shared/`, use the `@/` alias, for example `@/shared/composables/useX`.
- Within the same module, use relative paths so the module can move as a unit.
- The app shell imports a module through its public entry point, for example `@/modules/stock`.
- Keep one module-level `index.ts` as the public entry point; do not add barrel files to every internal folder.

## Project setup

The rules in this skill rely on tooling that each project sets up once:

- **Lint boundaries:** `no-restricted-imports` rules that block imports between modules and from `shared/` to a module.
- **Bundle check:** a Vite plugin that fails a single-module build when code from another module reaches the bundle.
- **Module selection:** a build-time variable, `VITE_APP_MODULE`, typed in `env.d.ts` and read in `src/router/index.ts`, that mounts one module at `/`.
- **CI:** lint, type-check, and tests as required checks on every pull request.

Without the lint rules and the bundle check, the commands below do not verify module boundaries.

## Verification

After changing a module, `shared/`, or the app shell, run these commands, adapted to the project's scripts:

```sh
npx eslint src                  # module boundaries, without applying fixes
npm run build                   # type-check and whole-app build
npm run build:<module>          # fails if another module's code reaches the bundle
npm run test:unit -- --run
```

Run `build:<module>` for every module the change touches; a change to `shared/` or a new module touches them all.

The `no-restricted-imports` rules do not catch dynamic `import()` between modules, imports of the app shell from a module or `shared/`, or app shell imports that bypass a module's public entry point, unless the project adds rules for them. Otherwise, check these by hand.

## Examples

These examples are illustrative: the paths come from a reference project and may not exist in your repository.

- `src/modules/stock/router/stock-id-guard.ts` (`assertStockIdAllowed`) is stock-only, so it sits next to `src/modules/stock/router/routes.ts`. `StockDetails.vue`, which also uses it, imports it relatively (`../router/stock-id-guard`).
- `src/shared/composables/useNavigationError.ts` records navigation errors (`router.onError` + `afterEach`). It lives in `shared/` because two consumers need it: `StockLayout.vue` (stock module) and `App.vue` (app shell, which shows the error when a direct load of `/stock/404` fails before any layout is mounted).
- `src/modules/stock/views/` holds `Stock*.vue`, and `src/modules/refill/views/` holds `Refill*.vue`; their routes are built by `createStockRoutes` and `createRefillRoutes`, exposed through their module entries and aggregated by `src/router/index.ts`.
- A future stock inventory workflow can live under `src/modules/stock/inventory/`; it does not become a root-level module merely because it has multiple steps.
