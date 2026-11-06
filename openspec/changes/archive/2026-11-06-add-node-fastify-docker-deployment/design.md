# Design

## Context

See `proposal.md` for the motivation and `specs/application-deployment/spec.md` for the behavior contract. The npm scripts exist for developer workstations (including Windows, hence `cross-env`) and build into `dist/default`, `dist/refill`, and `dist/stock`. `vite.config.ts` already derives the set of modules from the folders of `src/modules/`. The router reads `VITE_APP_MODULE` through `import.meta.env`, so the module choice is compiled into the frontend bundle and cannot be changed by setting a runtime environment variable.

## Goals / Non-Goals

**Goals:**
- Build separate production images for Refill, Stock, and the full application from one Dockerfile.
- Serve the selected build as a client-routed SPA from a Node.js Fastify server.
- Keep the runtime image limited to the selected build and production server dependencies.

**Non-Goals:**
- Switching application modes in a running container.
- Changing the existing npm build scripts, module routes, or router composition.
- Defining an orchestration platform, TLS termination, or deployment pipeline.

## Decisions

### Select the mode during image construction

Use a Docker build argument named `VITE_APP_MODULE`, exported as an environment variable and run `vite build` directly into a single `dist/app` directory; the npm scripts stay dedicated to developer workstations. An unset or empty value builds the full application. A non-empty value must be a plain name matching an existing `src/modules/<value>/` folder, otherwise the image build fails with a clear message before Vite runs; a new module is accepted as soon as its folder exists. Alternatives: a separate `APP_MODULES` list (duplicates the module folders), npm `build:<module>` scripts (one more script per module), or a central module registry (more machinery than needed now). Build-time selection matches Vite's compile-time environment handling. Runtime selection would require shipping all three builds in every image and would not change the already-compiled router.

### Use a multi-stage Node image

Use a Node 24 build stage to install project dependencies, run the type check once, and run `vite build`. Copy only `dist/app` and the Fastify server's production dependencies into the final Node 24 image, which runs the TypeScript server directly through Node's type stripping. Copying the selected output to one fixed static directory lets the server stay mode-agnostic and keeps the other modules out of standalone images.

### Serve static files with an SPA fallback

The Fastify server serves static files from the copied build directory and listens on `0.0.0.0`, using `PORT` with a default of `3000`. For browser navigation requests that do not match a static file, return `index.html` so Vue Router can resolve deep links. Missing static assets must remain `404` responses rather than returning the SPA document.

### Keep the existing development workflow

Add the container server and Docker configuration alongside the existing Vite scripts. Keep `npm run dev`, build scripts (with `cross-env`), and preview scripts unchanged; this keeps local development and the existing non-container build workflow independent from deployment packaging.

## Risks / Trade-offs

- **Mode changes require a new image** -> Treat the build argument as immutable image configuration and publish a distinct image tag for each mode.
- **SPA fallback can hide missing assets** -> Apply the fallback only to browser document navigation, and preserve `404` for missing static files.
- **Build-time dependencies can inflate the runtime image** -> Use separate build and runtime stages and copy only production dependencies and the selected output.

## Migration Plan

This is additive and does not replace existing npm workflows. Build and verify the full, Refill, and Stock images and an invalid module, then deploy the selected image through the target platform. Roll back by redeploying the previous image tag.