# Design

## Context

Current layout (observed): `src/views/` holds `StockLayout`, `StockDirectory`, `StockDetails`, `RefillLayout`, `RefillOverview`, `RefillSettings`; `src/router/index.ts` declares `/`, `/stock` and `/refill` with their children inline and lazy-loads the views via `../views/...`; `src/router/stock-id-guard.ts` exports `assertStockIdAllowed`, used by the stock `:id` route's `beforeEnter` and by `StockDetails.vue` (`onBeforeRouteUpdate`). `StockLayout.vue` imports the router singleton (`import router from '../router'`), registers `router.onError` and `router.afterEach` hooks (clearing the error only when there is no failure) and removes them in `onBeforeUnmount`; its template hides the banner when `route.meta.title === 'Stock details'`. `RefillLayout.vue` has no such logic. `src/stores/counter.ts` is unused demo code. `src/__tests__/App.spec.ts` imports only `../App.vue` and `../router` and asserts routes, titles, lazy-loading, the 404 guard and the error banner (`.stock-layout [role="alert"]`). The target layout is defined by `openspec/specs/vue-workflow-structure/spec.md` and the `vue-workflow-structure` skill. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- End state matches the `vue-workflow-structure` requirements for everything stock and refill.
- Zero behavior change for the migration itself, proven by the existing test suite, type-check and build. The single intentional addition is the direct-load error display (decision 8).

**Non-Goals:**
- Rewriting views, restyling, or changing route paths/metadata.
- Moving `src/stores/counter.ts`, adding barrels, or enforcing boundaries with lint.

## Decisions

**1. Target tree.**

```
src/
  workflows/
    stock/
      router/routes.ts, stock-id-guard.ts
      views/StockLayout.vue, StockDirectory.vue, StockDetails.vue
    refill/
      router/routes.ts
      views/RefillLayout.vue, RefillOverview.vue, RefillSettings.vue
  shared/
    composables/useNavigationError.ts
  router/index.ts          (router creation, '/', aggregation)
  stores/counter.ts        (unchanged)
```
No `components/` or `stores/` folder is created in either workflow: nothing belongs there yet (create-on-demand rule). `src/shared/` only holds `useNavigationError`, used by the app shell and a workflow (decision 5).

**2. Move files with `git mv`; keep file contents of the views verbatim apart from import paths and the extracted logic.**
Preserves history and keeps the diff reviewable. Alternative: recreate files; rejected because it loses rename tracking.

**3. Route records move verbatim into `stockRoutes` / `refillRoutes`.**
Keep `components: { default: ... }` and `props: { default: true }` as they are, because the tests assert `matched[1].props.default` and `components.default`. Normalising them to `component`/`props: true` would behave the same in vue-router but is an unrelated change. Lazy imports become relative to the workflow (`../views/...`).

**4. `src/router/index.ts` aggregates with the `@/` alias.**
`import { stockRoutes } from '@/workflows/stock/router/routes'`, same for refill; the `/` route with `EmptyRoute` stays in the app router. Order of records is preserved (`/`, stock, refill) so route matching is unchanged.

**5. `useNavigationError` returns the error ref and owns the hook lifecycle.**
The composable gets the router with `useRouter()` instead of importing the singleton (the old `../router` path no longer resolves after the move, and importing `src/router` from a view that the router lazy-loads would be circular), registers `onError` and `afterEach` with the existing logic unchanged (clear only when there is no failure), removes both in `onBeforeUnmount`, and returns `{ navigationError }`. `StockLayout.vue` keeps `useRoute()` and its template condition (`navigationError && route.meta.title !== 'Stock details'`), so the displayed behavior is identical. Alternative: leave the logic inline; rejected because it is reusable. It lives in `src/shared/composables/` because it is needed outside the stock workflow (by `App.vue`, see decision 8) and contains nothing stock-specific; importing it from `@/workflows/stock/...` in the app shell would couple the shell to one workflow. `shared/` is consumed by workflows and by the app shell (see the modified "Shared area" and "Promotion to shared" requirements in this change's spec delta).

**6. `stock-id-guard.ts` lives next to the stock routes; `StockDetails.vue` imports it relatively** (`../router/stock-id-guard`), `routes.ts` imports it as `./stock-id-guard`. Both stay inside the stock workflow, so relative imports apply.

**7. Tests.**
`App.spec.ts` is app-level (router + App) and stays in `src/__tests__/`. All existing tests must pass unmodified; editing one signals an unintended behavior change and should stop the work. The only addition is one new test for the direct-load error (decision 8).

**8. Show the error on a direct load of `/stock/404` from `App.vue`.**
Observed: on a direct load the initial navigation fails in the `beforeEnter` guard, the router stays on its start location (no matched record), `RouterView` renders nothing, and no layout exists to host a banner. `App.vue` does exist, and because the guard runs in an async chain, `App.vue` is set up before the error is raised, so a `useNavigationError()` call in `App.vue` is registered in time. `App.vue` renders a `role="alert"` banner when `navigationError && !route.matched.length`: an unresolved route only happens after a failed initial navigation, so the stock layout's own banner (and its hiding on valid detail pages) is untouched, and the existing test asserting no `.app-shell > [role="alert"]` after a click from `/stock` still holds. The banner reuses the layout's visual style via a small rule in `App.vue`. Alternative: redirect to `/stock` after the failure; rejected because the redirected navigation succeeds and `afterEach` would immediately clear the error. Alternative: show the banner in `App.vue` whenever an error exists; rejected because it would duplicate the stock layout's banner and contradict the existing test.

## Risks / Trade-offs

- [Moving files breaks a lazy import or alias path] → `npm run type-check` and `npm run build-only` catch unresolved imports; the route tests resolve every child route.
- [Extracting the composable changes hook timing] → Keep the registration in setup and the cleanup in `onBeforeUnmount` exactly as now; the two error-banner tests in `App.spec.ts` cover display and clearing.
- [Route order changes matching] → Aggregate in the existing order; tests assert matched paths.
- [Leftover references to `src/views` or `router/stock-id-guard`] → Grep for the old paths after the move.
- [`App.vue` is not set up before the initial guard error, so the banner never appears] → Write the direct-load test first and confirm it fails for the right reason; if the timing assumption is wrong, revisit decision 8 instead of patching around it.
- [The router is a module singleton, so a direct-load test cannot reuse the shared instance] → In that test, use `vi.resetModules()`, set the URL with `history.replaceState` to `/stock/404`, then dynamically import `../router` and `../App.vue` before mounting.
- [The `.navigation-error` style is duplicated between `App.vue` and `StockLayout.vue`] → Accepted for now (a few declarations); revisit if a third use appears.

## Migration Plan

Single commit-sized refactor on a branch: establish a green baseline, move and rewire in small steps, rerun tests/type-check/build after each step group. Rollback is `git revert` of the change; nothing persists outside the repository.
