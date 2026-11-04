# Proposal

## Why

The `workflows/` directory describes business journeys, but stock and refill are better represented as bounded application modules with their own routes, layouts, and URL prefixes. Renaming the root to `modules/` makes that boundary explicit and keeps the structure suitable for future module extraction without changing current navigation behavior.

## What Changes

- **BREAKING (internal paths):** Move the stock and refill trees from `src/workflows/` to `src/modules/` and update active imports and architecture examples to use the new paths.
- Rename the project skill from `vue-workflow-structure` to `vue-module-structure` and update its metadata and guidance to describe modules, their boundaries, and workflows as possible internal subdomains.
- Keep shared code under `src/shared/`, prevent module-to-module imports, and keep each module's routes composed by the application router.
- Preserve existing URL paths, route ownership, route-level lazy loading, and the generic `@/*` alias to `src/`. Module package extraction, micro-frontend support, and a module-level dynamic loader are future options, not implementation work in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `vue-workflow-structure`: Replace the root workflow layout convention with module-based organization, module boundaries, route composition, and corresponding agent guidance.

## Impact

- Source paths under `src/workflows/` and references in `src/router/index.ts`.
- `.github/skills/vue-workflow-structure/`, which will be renamed and rewritten for the module structure.
- The existing `vue-workflow-structure` OpenSpec capability, whose requirements describe the current layout.
- Type-checking, unit tests, and production build should confirm imports resolve and route behavior remains unchanged. No dependency or URL changes are expected.
