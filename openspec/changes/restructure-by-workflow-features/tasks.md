# Tasks

## 1. Stock workflow

- [x] 1.1 With `git mv`, create `src/workflows/stock/` holding `layout/StockLayout.vue`, `features/directory/views/StockDirectory.vue`, `features/details/views/StockDetails.vue` and `features/details/model/stock-id-guard.ts`; fix relative imports and verify `npm run type-check` passes
- [x] 1.2 Replace the `router` import in `StockLayout.vue` with `useRouter()` and verify no file under `src/workflows/` references `../router` (`grep` returns nothing)
- [x] 1.3 Add `directory-routes.ts`/`details-routes.ts` (relative paths, lazy components, `beforeEnter`, `meta`) and each feature `index.ts` exporting `directoryRoutes`/`detailsRoutes`; verify type-check passes
- [x] 1.4 Add `workflows/stock/index.ts` exporting `stockRoutes` (`/stock`, lazy `layout/StockLayout.vue`, children from both features) and verify type-check passes

## 2. Refill workflow

- [x] 2.1 With `git mv`, create `src/workflows/refill/` holding `layout/RefillLayout.vue`, `features/overview/views/RefillOverview.vue` and `features/settings/views/RefillSettings.vue`; verify type-check passes
- [x] 2.2 Add `overview-routes.ts`/`settings-routes.ts`, feature `index.ts` files, and `workflows/refill/index.ts` exporting `refillRoutes` (`/refill`, lazy layout, children); verify type-check passes

## 3. App shell and router

- [x] 3.1 Move `App.vue` to `src/app/App.vue` and `src/main.ts` imports from `./app`; verify `npm run build-only` succeeds
- [x] 3.2 Create `src/app/router/index.ts` with the root route and `...stockRoutes, ...refillRoutes` imported from `@/workflows/stock` and `@/workflows/refill`; delete `src/views/`, `src/router/` and `src/stores/counter.ts`
- [x] 3.3 Move `src/__tests__/App.spec.ts` to `src/app/__tests__/App.spec.ts`, fix its imports without changing assertions, and verify `npm run test:unit -- --run` passes with all existing tests

## 4. Import boundaries

- [x] 4.1 Add `no-restricted-imports` overrides to `eslint.config.ts` (outside-workflows override, one override per workflow built from a `workflows` list) and verify `npm run lint:eslint` passes on the migrated tree
- [x] 4.2 Verify each rule by temporarily adding a violating import (deep `@/workflows/stock/features/...` from `app`, `@/app` from a workflow, deep cross-workflow import), confirming `npm run lint:eslint` fails for each, then reverting them
- [x] 4.3 Run `npx madge --circular --extensions ts src` and confirm no circular dependency is reported

## 5. Final verification

- [x] 5.1 Run `npm run type-check`, `npm run lint`, `npm run test:unit -- --run` and `npm run build-only`; all succeed, and `git status` shows no files left in `src/views/` or `src/router/`
- [ ] 5.2 Run `npm run dev` and manually open `/stock`, `/stock/42`, `/stock/404`, `/refill`, `/refill/42/settings`; pages, titles and the 404 alert behave as before

## Workflow follow-up

- Update the `feature-oriented-design` skill wording if lint config path (`eslint.config.ts`) or test location conventions differ.
- Archive the change after review.
