# Design

## Context

The application router currently mounts `/`, `/stock` and `/refill`, each module hard-coding its prefix in its routes and layout links. See proposal.md for motivation and `specs/` for requirements. The project uses Vite 8, which exposes `VITE_`-prefixed process environment variables on `import.meta.env`.

## Goals / Non-Goals

**Goals:**
- One command per scenario: whole app, Refill alone, Stock alone.
- Standalone modules work with zero changes to their views beyond link style.

**Non-Goals:**
- Separate builds or deployments per module (only dev scripts).
- Serving two modules without prefix at the same time.

## Decisions

- **Custom env var as the selector** (`VITE_APP_MODULE=refill|stock`) read through `import.meta.env`, set inline by each script via `cross-env`. It is independent of the Vite mode (`development`/`production`), so the same variable can later select a module for `vite build`. Alternatives: Vite `--mode` (ties module choice to the dev/prod mode and `.env.<mode>` files, hard to combine with a build), separate entry points/HTML files (duplicates bootstrap code). `cross-env` is a new dev dependency, chosen so scripts work on Windows too.
- **Route factories with a prefix parameter** (`createRefillRoutes(prefix = '/refill')`). An empty prefix maps to `/`. Alternative: nesting module routes under a parent route with a prefix in the app router, which would still need the modules to avoid absolute paths; the factory keeps the router change local.
- **Named routes for internal links** (`refill-overview`, `refill-settings`, `stock-directory`, `stock-details`). Alternative: relative links, which break between sibling routes with different parents.
- **Router decides composition**: `src/router/index.ts` exports `appMode`; `App.vue` uses it to hide module navigation. An unset or unknown value behaves as the full app.

## Risks / Trade-offs

- [Typo in the variable value silently serves the full app] → typed as `'refill' | 'stock'` in `env.d.ts`; scripts are the only expected setters.
- [A module added later forgets named routes] → covered by the modified requirement in `vue-workflow-structure`.
- [Route names are global across modules] → prefixed with the module name.
