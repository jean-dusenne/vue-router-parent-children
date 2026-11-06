# Design

## Context

Standalone mode is selected by the `VITE_APP_MODULE` env var, read in `src/router/index.ts`. `dev:refill` and `dev:stock` already set it through `cross-env`. `build` runs `type-check` and `build-only` (plain `vite build` into `dist/`), and `preview` is plain `vite preview`. The router uses `createWebHistory`, so deep links need an SPA fallback, which `vite preview` provides by default. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One build and one serve script per mode (refill, stock, default), usable without flags.
- Builds from different modes coexist.

**Non-Goals:**
- No production deployment tooling or base-path (`BASE_URL`) changes.
- No change to application code or routing.

## Decisions

- **Serve with `vite preview`, not a new dependency.** It already honours the SPA fallback and `--outDir`, and reads the same env as the build. Alternative: `serve` or `http-server`; rejected as an extra dependency for no gain.
- **Per-mode output directory via `--outDir`**: `dist/refill`, `dist/stock`, `dist/default`. Passed on the CLI so `vite.config.ts` stays untouched. Alternative: derive `outDir` from `VITE_APP_MODULE` in the config; rejected as hidden behaviour, though it remains an option if scripts grow.
- **Default build moves to `dist/default`.** `build` and `serve` become a consistent pair with the other modes. Cost: anything reading `dist/` directly must change. Nothing in the repo does (to be confirmed in tasks).
- **Script names**: `build:refill`, `build:stock`, `serve:refill`, `serve:stock`, `serve`. Mirrors the existing `dev:*` naming. The existing `preview` is kept as an alias of `serve`.
- **Module builds skip type-check**; they run `build-only` style (`vite build`). Type-check is mode-independent and already runs in `build`. Running it per module would only repeat it.
- **Missing build guard**: `vite preview` does not fail when the output directory is absent (it still starts a server), so each serve script first runs `scripts/check-build.mjs`. It exits with a clear message if `dist/<mode>/index.html` is missing.

## Risks / Trade-offs

- [Stale build served after code changes] → Serve scripts never build; document "build, then serve" in the README.
- [Changing the default output path breaks external tooling] → Repo search in tasks; list the change in the README.
- [`--outDir` empties the target directory] → Each mode has its own directory, so no other mode is affected.
