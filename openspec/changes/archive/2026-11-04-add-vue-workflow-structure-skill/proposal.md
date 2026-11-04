# Proposal

## Why

The project is organised by technical type (`src/views`, `src/router`, `src/stores`). Stock logic is spread across layers: `stock-id-guard.ts` lives in `router/`, and navigation-error handling is inlined in `StockLayout.vue`. Nothing tells contributors or agents where new code belongs, so the structure drifts as features are added. A project skill that defines a workflow-oriented structure gives one shared answer before the code is migrated.

## What Changes

- Add a project skill `.github/skills/vue-workflow-structure/SKILL.md` describing a workflow-oriented structure for this Vue project, with `stock` and `refill` as the current workflows (the list is not exhaustive: new workflows follow the same structure).
- The skill defines, for each workflow, the classic Vue folders: `components/`, `composables/`, `stores/`, `views/` and `router/`. Folders are created only when they are needed.
- The skill defines a `shared/` area (components, composables, stores) for elements used by more than one workflow, and the rule for promoting an element there: when a second workflow actually needs it, not in anticipation.
- The skill defines dependency rules: a workflow may import `shared/` but never another workflow.
- The skill defines routing: each workflow exports its own routes (e.g. `stockRoutes`, `refillRoutes`) together with its guards, and `src/router/index.ts` only aggregates them.
- The skill uses the existing code as worked examples (`assertStockIdAllowed`, and the navigation-error logic of `StockLayout.vue` as a stock composable that would be promoted to `shared/` only if refill needs it).
- **Out of scope**: migrating existing code to the new structure. That is a separate, later change. No file under `src/` is modified here.

## Capabilities

### New Capabilities
- `vue-workflow-structure`: the conventions the skill enforces for organising Vue code by workflow (workflow folder layout, `shared/` promotion rule, inter-workflow dependency rule, per-workflow routes, import style).

### Modified Capabilities

None.

## Impact

- New file: `.github/skills/vue-workflow-structure/SKILL.md`.
- No change to application code, routes, dependencies or build configuration.
- Follow-up (not part of this change): a migration change that moves `src/views/*`, `src/router/stock-id-guard.ts` and the navigation-error logic into `src/workflows/` and `src/shared/`.
