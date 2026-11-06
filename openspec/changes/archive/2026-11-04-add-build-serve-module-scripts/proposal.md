# Proposal

## Why

Standalone Refill and Stock modes only exist as dev-server scripts (`dev:refill`, `dev:stock`). The production build and `vite preview` can only be run for the whole application. Contributors therefore cannot check that a single-module build behaves the same as in dev: root URLs without a module prefix, no module navigation, and correct base paths for built assets.

## What Changes

- Add `build:refill` and `build:stock` scripts that produce a production build of one module in standalone mode (`VITE_APP_MODULE` set).
- Add `serve:refill` and `serve:stock` scripts that serve that module's build, so it can be tested at the root URL.
- Add `serve` for the default (whole-application) build, as the counterpart of the existing `build`.
- Give each build its own output directory (for example `dist/refill`, `dist/stock`, `dist/default`) so the three builds can exist side by side and a serve script never shows a stale build from another mode.
- Keep the existing `dev`, `dev:refill`, `dev:stock`, `build` and `preview` scripts working.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `standalone-module-dev`: adds requirements for standalone build and serve scripts. This covers Refill, Stock and the default full application. It also covers the "Default URLs unchanged" requirement, which gains an explicit serve scenario.

## Impact

- `package.json`: new scripts.
- `vite.config.ts`: possible per-mode `build.outDir`, if not done through the CLI.
- No changes to application code, routes or dependencies. `cross-env` is already installed.
- `openspec/specs/standalone-module-dev/spec.md`: updated when the change is synced or archived.
