# Tasks

## 1. Module route factories and named routes

- [x] 1.1 Replace `refillRoutes` with `createRefillRoutes(prefix = '/refill')` and `stockRoutes` with `createStockRoutes(prefix = '/stock')`; an empty prefix maps to `/`. Verify: `npx vue-tsc --build` passes.
- [x] 1.2 Name the module routes `refill-overview`, `refill-settings`, `stock-directory`, `stock-details`, and export the factories from each module's `index.ts`. Verify: `npx vue-tsc --build` passes.
- [x] 1.3 Switch the links in `RefillLayout.vue` and `StockLayout.vue` to named routes. Verify: no `/refill` or `/stock` literal remains in `src/modules/*/views` (`grep -rn "to=\"/" src/modules` returns nothing).
- [x] 1.4 Add a unit test (Vitest) that builds a router with `createRefillRoutes('')` and `createStockRoutes('')` and checks that `/`, `/42/settings`, `/42` and `/404` resolve (the last one throws through the stock id guard), and that the default prefixes still resolve `/refill` and `/stock`. Verify: `npm run test:unit -- --run` passes.

## 2. Module selection by environment variable

- [x] 2.1 Type `VITE_APP_MODULE` as `'refill' | 'stock'` (optional) in `env.d.ts`. Verify: `npx vue-tsc --build` passes.
- [x] 2.2 In `src/router/index.ts`, read `import.meta.env.VITE_APP_MODULE`, mount the selected module with an empty prefix, fall back to the full app otherwise, and export `appModule`. Verify: `npx vue-tsc --build` passes.
- [x] 2.3 Hide the Stock/Refill navigation in `App.vue` when `appModule` is set. Verify: in `npm run dev:refill` the header shows no module links.
- [x] 2.4 Add a unit test of `App.vue` or the router composition covering the full-app default (navigation visible, `/stock` and `/refill` served). Verify: `npm run test:unit -- --run` passes.

## 3. npm scripts

- [x] 3.1 Add `cross-env` as a dev dependency. Verify: it appears in `package.json` `devDependencies`.
- [x] 3.2 Define `dev` (`vite`), `dev:refill` (`cross-env VITE_APP_MODULE=refill vite`) and `dev:stock` (`cross-env VITE_APP_MODULE=stock vite`). Verify: the three scripts are listed by `npm run`.

## 4. Integration checks

- [x] 4.1 Run `npm run dev`: `/` loads, `/stock` and `/refill` work, header navigation is visible.
- [x] 4.2 Run `npm run dev:refill`: `/` shows the Refill overview, the settings link goes to `/42/settings`, no URL contains `/refill`, no module navigation is shown.
- [x] 4.3 Run `npm run dev:stock`: `/` shows the Stock directory, links go to `/42` and `/404` (guard error shown), no URL contains `/stock`.
- [x] 4.4 Run `npm run lint` and `npm run build`. Verify: both succeed.
