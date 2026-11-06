# Tasks

## 1. Migrate source modules

- [x] 1.1 Move the stock and refill trees from `src/workflows/` to `src/modules/`, preserving their internal structure; verify both new module directories exist and `src/workflows/` is gone.
- [x] 1.2 Add `index.ts` public exports for each module's route collection and update `src/router/index.ts` to import through `@/modules/stock` and `@/modules/refill`; verify `npm run type-check` passes without changing the generic `@` alias.
- [x] 1.3 Preserve route URLs, layouts, guards, and route-level lazy component imports; verify `npm run test:unit -- --run` passes, including the existing route and lazy-loading tests.

## 2. Update architecture guidance

- [x] 2.1 Rename `.github/skills/vue-workflow-structure/` to `.github/skills/vue-module-structure/` and update its metadata and examples for module boundaries, public entry points, shared code, and nested workflows; verify the new skill path and name are present and the old skill directory is absent.
- [x] 2.2 Search active source and skill guidance for stale `src/workflows/`, `@/workflows/`, and `vue-workflow-structure` references; verify there are no active matches while leaving archived changes and `.github/workflows/` untouched.

## 3. Verify integrated change

- [x] 3.1 Run `npm run build` and `openspec validate rename-workflows-to-modules`; verify the production build and change validation both pass.
