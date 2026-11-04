## 1. Build scripts

- [x] 1.1 In `package.json`, point `build-only` at `--outDir dist/default`, and add `build:refill` and `build:stock` (`cross-env VITE_APP_MODULE=<m> vite build --outDir dist/<m>`). Verify: running `npm run build`, `build:refill`, `build:stock` leaves `dist/default`, `dist/refill`, `dist/stock` all present.
- [x] 1.2 Search the repo (excluding `node_modules`) for other readers of `dist/`. Verify: `grep -rn "dist" --exclude-dir=node_modules --exclude-dir=.git .` shows nothing that needs updating, or those references are updated.

## 2. Serve scripts

- [x] 2.1 Add `serve`, `serve:refill`, `serve:stock` (`vite preview --outDir dist/<mode>`, guarded by `scripts/check-build.mjs`) and keep `preview`. Verify: each serves its own build, e.g. `serve:refill` shows Refill at `/` with no module navigation, `serve:stock` shows Stock at `/`, `serve` shows `/stock` and `/refill` with navigation.
- [x] 2.2 Verify deep link reload: with `serve:refill`, `curl -s -o /dev/null -w "%{http_code}" localhost:<port>/42/settings` returns 200 with the app HTML.
- [x] 2.3 Verify the missing-build case: delete `dist/stock`, run `npm run serve:stock`. It fails with a clear message and does not serve another mode. Add a guard script only if the message is unclear.

## 3. Documentation

- [x] 3.1 Document the build/serve scripts and the `dist/<mode>` layout (build, then serve) in the README, or add a short scripts section if none exists. Verify: the README lists all five new scripts.

## 4. Build tests

- [x] 4.1 Add `src/__tests__/standalone-builds.spec.ts`, which builds each mode and checks its chunks: Refill has no Stock pages, Stock has no Refill pages, default has both. Verify: `npx vitest run` passes.
