# Proposal

## Why

When working on a single module (Refill or Stock), the developer has to browse under `/refill` or `/stock`, which does not reflect how that module will be served on its own. Contributors need dev entry points that serve one module at the root URL, with no module prefix, while keeping the full-app entry point.

## What Changes

- Add three npm scripts:
  - `npm run dev` serves the full application (`/`, `/stock`, `/refill`).
  - `npm run dev:refill` serves the Refill module at `/` (no `/refill` in any URL, including internal links).
  - `npm run dev:stock` serves the Stock module at `/` (no `/stock` in any URL, including internal links).
- Select the served module through a custom environment variable, `VITE_APP_MODULE` (`refill` or `stock`), set by the scripts; the application router mounts only that module with an empty prefix. The same variable is meant to be reused later by build scripts.
- Module route factories (`createRefillRoutes(prefix)`, `createStockRoutes(prefix)`) accept the URL prefix, defaulting to `/refill` and `/stock`.
- Module-internal links use named routes instead of hard-coded paths, so they remain correct under any prefix.
- Hide the Stock/Refill navigation of the application shell when a single module is served.

No production URL changes: the default build and `npm run dev` keep `/stock` and `/refill`.

## Capabilities

### New Capabilities
- `standalone-module-dev`: dev scripts and env-var-driven routing that serve the whole app or a single module at the root URL.

### Modified Capabilities
- `vue-workflow-structure`: the requirement "Routes owned by each workflow" changes, since a module's URL prefix becomes a parameter of its route factory instead of a fixed value, and its internal links must not hard-code the prefix.

## Impact

- `package.json`: `dev`, `dev:refill`, `dev:stock` scripts; `cross-env` added as a dev dependency so the variable is set the same way on every OS.
- `env.d.ts`: typing of `VITE_APP_MODULE`.
- `src/router/index.ts`: env-var-based route composition; exports `appModule`.
- `src/modules/refill/` and `src/modules/stock/`: route factories, named routes, layout links.
- `src/App.vue`: conditional navigation.
