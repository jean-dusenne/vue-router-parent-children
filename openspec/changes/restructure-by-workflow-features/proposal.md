# Proposal

## Why

The source is flat (`src/views/` holds six views, `src/router/` holds every route and a stock-specific guard). The project has two business workflows, `stock` and `refill`, each owning several features and a parent layout. A flat layout cannot express this, hides ownership, and lets workflows couple freely (`StockLayout.vue` imports the app router instance). The `feature-oriented-design` skill now defines a `workflows/<workflow>/features/<feature>` structure with enforced import boundaries, but the code does not follow it yet.

## What Changes

- Move bootstrap and routing into `src/app/` (`App.vue`, router assembly); `src/main.ts` stays the Vite entry.
- Create `src/workflows/stock/` with features `directory` and `details`, a `layout/` holding `StockLayout.vue`, and a public `index.ts` exporting `stockRoutes`.
- Create `src/workflows/refill/` with features `overview` and `settings`, a `layout/` holding `RefillLayout.vue`, and a public `index.ts` exporting `refillRoutes`.
- Each feature exposes its child routes through its own `index.ts` (lazy components only); each workflow composes them under its lazy parent layout.
- Move `stock-id-guard` into the `details` feature; the guard and its tests stay with the route that uses it.
- Replace the direct `router` import in `StockLayout.vue` with `useRouter()` so a workflow never imports from `app/`.
- Remove the unused `src/stores/counter.ts` template store.
- Enforce the import boundaries from the skill with `no-restricted-imports` overrides in `eslint.config.ts`.
- Move `App.spec.ts` next to `App.vue` and keep its assertions unchanged.
- No change to URLs, route paths, titles, guards or rendered UI.

## Capabilities

### New Capabilities
- `source-organization`: how `src/` is organized into `app`, `core`, and `workflows/<workflow>/features/<feature>`, public entry points, route composition, and lint-enforced import boundaries.

### Modified Capabilities

None. No user-visible behavior changes.

## Impact

- Code: every file under `src/views/`, `src/router/`, `src/App.vue`, `src/stores/`, and `src/__tests__/App.spec.ts` is moved or edited; imports updated.
- Tooling: `eslint.config.ts` gains boundary rules. `tsconfig.app.json` already maps `@/*` to `src/*`; no change expected.
- No new runtime dependencies. No API or route changes. `index.html` and `vite.config.ts` are unaffected (`src/main.ts` path is kept).
- Out of scope: route names, typed `meta`, a `core/` directory (created when a second consumer appears), and extending the skill with router notions.
