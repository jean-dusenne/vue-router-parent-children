# Design

## Context

See proposal.md for motivation. The source is flat: `src/views/` holds `StockLayout`, `StockDirectory`, `StockDetails`, `RefillLayout`, `RefillOverview`, `RefillSettings`; `src/router/index.ts` declares all routes; `src/router/stock-id-guard.ts` serves only `StockDetails`; `App.vue` sits at the `src/` root and sets the document title from `route.meta.title` and `route.params.id`.

Constraints found in the code:
- `StockLayout.vue` imports the router instance from `../router`, and the router lazy-imports `StockLayout.vue`: a workflow-to-app dependency and a hidden cycle.
- `src/__tests__/App.spec.ts` is the only test and covers route resolution, lazy loading, titles and the stock 404 guard. It is the behavior baseline for this change.
- Tooling globs assume tests live in `src/**/__tests__/*` (`tsconfig.app.json`, `tsconfig.vitest.json`, `eslint.config.ts`). `@/*` is already aliased to `src/*` in `tsconfig.app.json` and `vite.config.ts`.
- The lint config is `eslint.config.ts`, not `.mjs` as the skill text says.
- There are no shared consumers yet, so there is no `core/` code to move. `stores/counter.ts` is unused.

## Goals / Non-Goals

**Goals:**
- Reach the target structure from the `feature-oriented-design` skill with zero behavior change, verified by the existing test suite.
- Make the dependency directions lint-enforced where lint can express them.

**Non-Goals:**
- No route names, typed `meta`, or navigation-by-name; links in layouts keep their hard-coded paths.
- No `core/` and no `workflows/<w>/shared/` until a second consumer exists.
- No change to the test location convention (`__tests__/`).
- No new dependency (no `eslint-plugin-boundaries`, no `madge` in `package.json`).

## Decisions

### Target tree

```text
src/
  main.ts                       # Vite entry, unchanged path
  app/
    App.vue
    router/index.ts             # root route + ...stockRoutes + ...refillRoutes
    __tests__/App.spec.ts
  workflows/
    stock/
      index.ts                  # exports stockRoutes
      layout/StockLayout.vue
      features/
        directory/{index.ts, directory-routes.ts, views/StockDirectory.vue}
        details/{index.ts, details-routes.ts, views/StockDetails.vue, model/stock-id-guard.ts}
    refill/
      index.ts                  # exports refillRoutes
      layout/RefillLayout.vue
      features/
        overview/{index.ts, overview-routes.ts, views/RefillOverview.vue}
        settings/{index.ts, settings-routes.ts, views/RefillSettings.vue}
```

### Route composition
Each feature exports `<feature>Routes: RouteRecordRaw[]` with relative child paths (`''`, `':id'`, `':id/settings'`) and lazy components. The workflow `index.ts` builds one parent record (`path: '/stock'`, lazy layout, `children: [...directoryRoutes, ...detailsRoutes]`) and exports it as `stockRoutes`. `app/router` spreads the workflow arrays. The parent path prefix is therefore known only to its workflow.
- Alternative considered: keep all routes in `app/router`. Rejected: it keeps the central file coupled to every feature and defeats ownership.
- Alternative considered: workflow-level route file with all children. Rejected: features would not own their routes or guards.

### Route files in features
Route definitions live in `<feature>-routes.ts` (domain-named, per the skill) and are re-exported by the feature's `index.ts`. `index.ts` never exports `.vue` files.

### Guard placement
`stock-id-guard.ts` moves to `features/details/model/` because only the `details` route and view use it. `StockDetails.vue` imports it relatively.

### Remove the workflow-to-app dependency
`StockLayout.vue` replaces `import router from '../router'` with `useRouter()`. It resolves to the same instance because the router is installed as a plugin, in the app and in the existing tests.

### App shell moves, entry stays
`App.vue` and the router move to `src/app/`; `src/main.ts` stays at its path so `index.html` and Vite are untouched.

### Test location
`App.spec.ts` moves to `src/app/__tests__/` and keeps its assertions. It exercises the whole app (router plus App shell), so it belongs to `app`. Keeping `__tests__/` avoids editing three tooling globs. The skill's "co-locate `<file>.spec.ts`" applies to new unit tests; feature-level tests added later should be co-located and widen the globs at that time.

### Lint boundaries
`no-restricted-imports` overrides in `eslint.config.ts`, with a `workflows` list constant. Each file matches exactly one override, because a later override replaces an earlier one for the same rule instead of merging.
- Files outside `src/workflows/**` (app, main, tests): block any import that goes below a workflow root (`@/workflows/*/**`, `**/workflows/*/**`); only `@/workflows/<w>` is allowed.
- Files in `src/workflows/<w>/**` (one override per workflow): block `@/app`, `@/app/**`, `**/app`, `**/app/**`; block deep imports into every other workflow, both aliased (`@/workflows/<other>/**`, `**/workflows/<other>/**`) and relative (`../**/<other>/**`); allow `@/workflows/<other>` itself. The relative pattern would also reject an own segment named like another workflow reached through `../` (e.g. a refill feature called `stock`); rename such a segment or adjust the pattern if that arises.
- Within a workflow, own files are imported relatively, as the skill requires.

Limits of the approach: relative imports cannot be classified by pattern, so a deep relative import from one feature into a sibling feature is not caught by lint. Mitigation: code review plus the manual cycle check below. `eslint-plugin-boundaries` would close the gap but adds a dependency; revisit when a third workflow appears.
- Alternative considered: `eslint-plugin-boundaries`. Deferred for the reason above.

### Circular dependency check
Run `npx madge --circular --extensions ts src` once after the move and fix any cycle. It is a manual verification step; `.vue` files are not parsed by it, so the `StockLayout` to router cycle is removed by construction (decision above), not by the tool.

### Remove `stores/counter.ts`
It is unreferenced template code; deleting it avoids a misleading `src/stores/` at root, which the skill does not allow (`app/` defines no stores).

## Risks / Trade-offs

- [A moved import path breaks lazy loading or a title] -> The existing 11 tests cover resolution, lazy functions, titles and guards; run them after each move group.
- [`useRouter()` changes error handling timing in `StockLayout`] -> The tests that click the 404 link and check the alert stay unchanged and must pass.
- [Lint rule gaps on relative imports] -> Documented limitation; manual check in tasks.
- [Override replacement semantics make a boundary rule silently inactive] -> Verify each rule by temporarily adding a violating import and confirming lint fails, then reverting.
- [Skill text refers to `eslint.config.mjs`] -> Implementation edits `eslint.config.ts`; skill wording is a follow-up, not blocking.

## Migration Plan

1. Move files with `git mv` to preserve history, workflow by workflow, running tests after each.
2. Switch `app/router` to the workflow entry points and delete `src/views/` and `src/router/`.
3. Add lint boundaries last, so violations found by lint can be fixed in the final tree.
4. Rollback: revert the change commit; nothing outside `src/` and `eslint.config.ts` is touched and no data or API is involved.
