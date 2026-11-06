# Tasks

## 1. Baseline

- [x] 1.1 Run `npm run test:unit -- --run`, `npm run type-check` and `npm run build-only` on the untouched code; verify all three pass so later failures can be attributed to the migration.

## 2. Stock workflow

- [x] 2.1 `git mv` `StockLayout.vue`, `StockDirectory.vue`, `StockDetails.vue` from `src/views/` to `src/workflows/stock/views/` and `src/router/stock-id-guard.ts` to `src/workflows/stock/router/`; update the guard import in `StockDetails.vue` to `../router/stock-id-guard`; verify the files exist at the new paths and not at the old ones (`git status`).
- [x] 2.2 Create `src/workflows/stock/router/routes.ts` exporting `stockRoutes` (the `/stock` record and its children moved verbatim, lazy imports relative to `../views/`, guard imported from `./stock-id-guard`); verify `npm run type-check` has no error in this file.
- [x] 2.3 Create `src/workflows/stock/composables/useNavigationError.ts` containing the `router.onError` / `afterEach` logic (unchanged behavior, cleanup in `onBeforeUnmount`, router obtained with `useRouter()` instead of the singleton import) and returning `{ navigationError }`; use it in `StockLayout.vue` in place of the inline logic without changing template or styles; verify the two stock error-banner tests in `src/__tests__/App.spec.ts` still pass.

## 3. Refill workflow

- [x] 3.1 `git mv` `RefillLayout.vue`, `RefillOverview.vue`, `RefillSettings.vue` from `src/views/` to `src/workflows/refill/views/`; verify `src/views/` is empty and removed.
- [x] 3.2 Create `src/workflows/refill/router/routes.ts` exporting `refillRoutes` (the `/refill` record and its children moved verbatim, lazy imports relative to `../views/`); verify `npm run type-check` has no error in this file.

## 4. Router aggregation

- [x] 4.1 Rewrite `src/router/index.ts` to keep router creation and the `/` route and to spread `stockRoutes` then `refillRoutes` (imported via `@/workflows/...`), removing the inline records and the guard import; verify `npm run test:unit -- --run` passes with `src/__tests__/App.spec.ts` unmodified.

## 5. Direct-load error

- [x] 5.1 Add a test to `src/__tests__/App.spec.ts` (using `vi.resetModules()`, `history.replaceState` to `/stock/404`, then dynamic imports of `../router` and `../App.vue`) that mounts the app and expects `[role="alert"]` with "Stock ID 404 not found" after `flushPromises()`; run it and verify it **fails** because no banner is rendered (not because of a test setup error).
- [x] 5.2 `git mv` `src/workflows/stock/composables/useNavigationError.ts` to `src/shared/composables/useNavigationError.ts` and update the import in `StockLayout.vue` to `@/shared/composables/useNavigationError`; remove the empty `src/workflows/stock/composables/` folder; verify the existing tests and `npm run type-check` still pass.
- [x] 5.3 In `App.vue`, call `useNavigationError()` and render a `role="alert"` banner when `navigationError && !route.matched.length`, with a `.navigation-error` rule matching the stock layout's style; verify the new test passes and every existing test passes unmodified.
- [x] 5.4 Update the `useNavigationError` worked example in `.github/skills/vue-workflow-structure/SKILL.md` (it now lives in `src/shared/composables/` because the app shell and `stock` both use it) and the other statements made stale by the migration (intro "migrated by a later change", "target state" examples, promotion rule mentioning the app shell); verify no sentence still says it stays in `stock/composables/` (`grep -n useNavigationError`).

## 6. Spec alignment

- [x] 6.1 Add the delta `specs/vue-workflow-structure/spec.md` modifying "Shared area for cross-workflow elements", "Promotion to shared on actual reuse" (the app shell counts as a consumer) and "Routes owned by each workflow" (the app router may define app-level routes such as `/`), and align the corresponding statements in `.github/skills/vue-workflow-structure/SKILL.md`; verify `openspec validate migrate-to-workflow-structure --strict` passes and the skill and delta use the same rule (`grep -n "app shell"`).

## 7. Verification

- [x] 7.1 Run `npm run test:unit -- --run`, `npm run type-check`, `npm run build-only` and `npx eslint src` (without `--fix`); verify all pass and `git diff --stat` shows `main.ts` unchanged and `App.spec.ts` changed only by the added test.
- [x] 7.2 Grep `src` for `views/`, `router/stock-id-guard` and `../views` references outside `src/workflows/`; verify no stale path remains, and compare `src/workflows/` and `src/shared/` with the `vue-workflow-structure` spec requirements (layout, folders on demand, no cross-workflow imports, routes per workflow).
- [x] 7.3 Start `npm run dev` and, in a browser, check `/stock`, `/stock/42`, `/refill` and `/refill/42/settings` render with correct titles; click "Stock 404 (error)" from `/stock` (banner in the stock page, URL unchanged) and from `/stock/42` (no banner); load `/stock/404` directly and verify the banner "Stock ID 404 not found" is visible.
