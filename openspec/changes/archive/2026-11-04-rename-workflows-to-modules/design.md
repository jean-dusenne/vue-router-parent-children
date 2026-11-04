# Design

## Context

See `proposal.md` for motivation. The current stock and refill trees live under `src/workflows/`; the app router imports their route arrays by internal router paths. TypeScript and Vite both define the generic `@` alias to `src/`, with no workflow-specific alias. The views are already lazy-loaded by their route records, and unit tests cover route matching, layouts, metadata, and navigation behavior.

## Goals / Non-Goals

**Goals:**

- Make each module the source-level boundary for its views, routes, and module-specific code.
- Give each module a stable public entry point for root-router composition.
- Preserve the shared-code boundary and keep peer modules independent.
- Keep current URL and route behavior unchanged.

**Non-Goals:**

- Add a module-level asynchronous loader, package extraction, or micro-frontend runtime.
- Add a new TypeScript/Vite alias mapping; the existing `@` alias already resolves paths under `src/`.
- Change historical archived OpenSpec artifacts or the unrelated `.github/workflows/` CI directory.

## Decisions

### Use `src/modules/<module>/` as the root boundary

Move the existing stock and refill directories intact to `src/modules/stock/` and `src/modules/refill/`, retaining their `views/` and `router/` organization. Keep cross-module and app-shell code in `src/shared/`; leave unrelated demo code such as `src/stores/counter.ts` untouched.

**Alternative considered:** Keep `workflows/` and explain that it contains modules. Rejected because the root directory name would continue to imply that stepwise business journeys define the application boundary.

### Compose modules through `index.ts`

Add a public `index.ts` in each module that exports its route collection from the existing `router/routes.ts`. Change `src/router/index.ts` to import those public exports via `@/modules/stock` and `@/modules/refill`, then aggregate them as it does today. Module internals continue using relative imports. The module entry point is for application composition and future extraction; it does not permit peer modules to depend on each other. Shared functionality belongs in `src/shared/`.

**Alternative considered:** Keep root-router imports pointed at each module's internal `router/routes.ts`. Rejected because it bypasses the module boundary and makes the root router depend on implementation paths.

### Keep the generic alias and current lazy-loading model

Rewrite aliased references from `@/workflows/...` to the new `@/modules/...` entry points. Leave the `@/*` TypeScript mapping and Vite `@` alias unchanged. Keep route component imports lazy inside the route records; module-level dynamic loading would require a separate route-registration design and is not needed for this rename.

**Alternative considered:** Add a dedicated alias such as `@modules/*` or dynamically import modules from the application router. Rejected as unnecessary configuration and behavior change for the current route aggregation.

### Rename the skill, but retain the existing OpenSpec capability path

Move `.github/skills/vue-workflow-structure/` to `.github/skills/vue-module-structure/`, update its frontmatter and examples, and describe workflows as possible nested module subdomains. Modify the existing `vue-workflow-structure` capability at its established OpenSpec path rather than creating a parallel capability for the same architectural conventions.

**Alternative considered:** Introduce a new OpenSpec capability alongside the existing one. Rejected because it would duplicate the same conventions and split their history.

## Risks / Trade-offs

- **A path reference may be missed** → Search active source and skill guidance for `src/workflows/` and `@/workflows/`, then run type-checking, unit tests, and the production build. Preserve archived artifacts and the unrelated GitHub Actions `.github/workflows/` path.
- **The new entry point could become a peer-module import escape hatch** → Document that module-to-module dependencies remain prohibited and that reusable code belongs in `src/shared/`.
- **A module-level dynamic import could change route registration semantics** → Keep current synchronous route-array aggregation and existing route-component lazy imports; defer dynamic module loading to a separate design.

## Migration Plan

1. Move the stock and refill source trees under `src/modules/`, preserving their internal relative paths.
2. Add each module's public `index.ts` export and update the application router's aliased imports.
3. Rename and update the Vue module structure skill, then update the existing capability requirements.
4. Run type-checking, unit tests, and the production build; verify route paths and lazy-loaded route components remain unchanged.

No runtime data migration or deployment coordination is required. Rollback consists of moving the directories back and restoring the previous imports, skill path, and capability wording; URLs remain unchanged either way.
