# Tasks

## 1. Fastify static server

- [x] 1.1 Add Fastify and its static-file plugin as production dependencies, implement the Node.js server for the selected static build, and verify it starts with the configured host and port.
- [x] 1.2 Add server tests for the application entry point, client-side route fallback, and missing-asset 404 behavior; verify the targeted Vitest tests pass.

## 2. Mode-specific Docker images

- [x] 2.1 Add a multi-stage Dockerfile that exports the `VITE_APP_MODULE` build argument, fails when it is non-empty and does not match a plain `src/modules/<name>/` folder, runs the type check and `vite build --outDir dist/app`, and copies only `dist/app` into the runtime image; verify the default, refill and stock builds succeed and `--build-arg VITE_APP_MODULE=unknown` and `--build-arg VITE_APP_MODULE=../x` fail.
- [x] 2.2 Add a Docker build-context ignore file and document in the README the build and run commands for each mode, and that a new module needs its `src/modules/<module>/` folder (plus its entry in `env.d.ts` and the router); verify the documented commands match the Dockerfile behavior.

## 3. Container integration verification

- [x] 3.1 Run each built image and verify its expected root page, direct client-side route, and static asset response, including that missing static assets return 404.