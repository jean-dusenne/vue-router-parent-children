# Design

## Context

The app is a small vue-router POC (Vue 3.5, Pinia, vue-router 5, `@` alias to `src`). Today `src/` is organised by technical type: `views/` holds the six stock/refill pages, `router/index.ts` declares all routes inline, `router/stock-id-guard.ts` holds a stock-only guard, and `stores/counter.ts` is demo code. There are no `components/` or `composables/` folders. `StockLayout.vue` carries inline navigation-error logic (`router.onError` + `afterEach`); `RefillLayout.vue` has none. See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**
- Give agents and contributors one unambiguous rule for where each kind of Vue code goes.
- Keep the skill short enough to be read in full and concrete enough to apply without interpretation.

**Non-Goals:**
- Moving any existing file (separate migration change).
- Enforcing the rules with tooling (lint boundaries, import restrictions). The skill is guidance only for now.
- Defining conventions beyond structure (naming of components, testing layout, styling).

## Decisions

**1. Skill location: `.github/skills/vue-workflow-structure/SKILL.md`.**
Same place as the existing project skills, so it is discovered the same way. Alternative: a user-level skill; rejected because the structure is specific to this project.

**2. Layout: `src/workflows/<workflow>/{components,composables,stores,views,router}` plus `src/shared/{components,composables,stores}`.**
The unit of organisation is the *workflow* (stock, refill): a user-facing business flow with its own pages and routes, which is how this project already reasons about its features. "Workflow" is preferred over "domain" because the code is split by flow of work, not by a DDD bounded context with its own model. A `workflows/` wrapper keeps the `src/` root readable (`workflows`, `shared`, `router`, `App.vue`, `main.ts`). Alternative: `src/stock`, `src/refill` at the root; rejected because it mixes workflows with app-level files. Alternative: one flat folder per workflow; rejected because the request is explicitly to keep the classic Vue folders inside each workflow.

**3. Folders created on demand.**
Avoids empty folders and `.gitkeep` noise, and a workflow's shape shows what it actually uses.

**4. Promotion to `shared/` on second real use.**
Prevents `shared/` from becoming a catch-all of speculative abstractions. Alternative: promote on first generic-looking element; rejected as unverifiable. The cost is a move-and-update-imports step when the second workflow arrives, which is cheap in a small codebase.

**5. One-way dependencies: workflows → shared; no workflow → workflow; no shared → workflow.**
Keeps workflows removable and stops stock/refill from coupling. Cross-workflow needs are solved by promotion rather than by exceptions.

**6. Routes exported per workflow, aggregated in `src/router/index.ts`.**
Workflow guards (e.g. the stock id guard) move with their workflow. The app router keeps only app-level routes (such as `/`) and the spread of workflow route arrays. Alternative: keep one route file; rejected because it keeps cross-workflow knowledge in a single place.

**7. Imports: `@/` alias across layers, relative inside a workflow.**
The alias already exists in `vite.config.ts` and `tsconfig.app.json`. Relative paths inside a workflow keep it movable as a unit. No per-workflow `index.ts` barrel for now, to avoid circular-import and tree-shaking issues; it can be added later.

**8. Skill content structure.**
Frontmatter (`name`, `description` saying when to use), the target tree, a placement table (kind of code → folder), the dependency and promotion rules, route aggregation pattern, and worked examples taken from this repo (`assertStockIdAllowed`; a `useNavigationError` composable extracted from `StockLayout.vue`). The examples describe the target state; they are labelled as such since the migration is not done here.

## Risks / Trade-offs

- [Skill describes a structure the code does not yet follow] → The skill states that existing code is migrated by a later change, and tells agents to apply the structure to new code and to code they touch.
- [Rules are not enforced] → Mitigation is review; a lint-based boundary check is a possible follow-up, deliberately out of scope.
- [Promotion rule can be applied inconsistently] → Skill gives the concrete trigger (a second workflow imports it) and a worked scenario.
- [Navigation-error composable is only a candidate] → It starts in `stock/composables/` and moves to `shared/` only if refill needs it; the skill presents it as an illustration of the promotion rule, not as a requirement.
