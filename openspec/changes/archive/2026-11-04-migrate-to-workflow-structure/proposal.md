# Proposal

## Why

The `vue-workflow-structure` capability and skill define how the project must be organised (`src/workflows/<workflow>/` and `src/shared/`), but the code still follows the old technical-type layout: all six pages in `src/views/`, all routes inline in `src/router/index.ts`, the stock-only guard in `src/router/stock-id-guard.ts`, and navigation-error handling inlined in `StockLayout.vue`. Until the code is migrated, the skill describes a target the repository contradicts, and agents will copy the old layout.

## What Changes

- Move the stock pages (`StockLayout`, `StockDirectory`, `StockDetails`) to `src/workflows/stock/views/` and the refill pages (`RefillLayout`, `RefillOverview`, `RefillSettings`) to `src/workflows/refill/views/`, using `git mv` to keep history.
- Move `stock-id-guard.ts` to `src/workflows/stock/router/` and declare the stock routes in `src/workflows/stock/router/routes.ts` (`stockRoutes`); declare the refill routes in `src/workflows/refill/router/routes.ts` (`refillRoutes`).
- Reduce `src/router/index.ts` to router creation, the `/` route, and the aggregation of `stockRoutes` and `refillRoutes`.
- Extract the navigation-error logic (`router.onError` + `afterEach`, cleanup on unmount) from `StockLayout.vue` into a `useNavigationError` composable in `src/shared/composables/`, because both `StockLayout.vue` and `App.vue` use it.
- Behavior is unchanged (same URLs, route metadata, document titles, 404 guard, error display in the stock layout, markup and styles) **except one addition**: when `/stock/404` is loaded directly (typed URL or page refresh), the error "Stock ID 404 not found" is now shown. Today nothing is shown because the initial navigation fails before any layout exists. `App.vue` displays it when an error is recorded and no route is resolved.
- **Out of scope**: `src/stores/counter.ts` (demo code, unused by any workflow) stays where it is; no lint-based boundary enforcement; no change to `main.ts`; no change to the existing hiding of the banner on valid stock detail pages.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `vue-workflow-structure`: three requirements change. "Shared area for cross-workflow elements" now also covers elements used by a workflow and the app shell (`App.vue`, `src/router`), and "Promotion to shared on actual reuse" now triggers on a second *consumer* (another workflow or the app shell) instead of only a second workflow, because the app shell legitimately needs a shared composable. "Routes owned by each workflow" no longer says the application router "only aggregates": it aggregates workflow routes and may define app-level routes such as `/`, which is what the code does. The direct-load error display itself stays covered by tests, not by a spec.

## Impact

- Moved files: six `.vue` views, `stock-id-guard.ts`; new files: two `routes.ts` and `src/shared/composables/useNavigationError.ts`; edited: `src/router/index.ts`, `StockLayout.vue`, `App.vue` (error banner on unresolved route), `src/__tests__/App.spec.ts` (new direct-load test), and the `useNavigationError` example in `.github/skills/vue-workflow-structure/SKILL.md`.
- `src/views/` is removed once empty.
- Existing tests in `src/__tests__/App.spec.ts` act as the regression safety net and must pass unmodified; the only change to that file is one new test for the direct-load error.
- No new dependencies, no build-config changes (the `@` alias already exists).
