# Proposal

## Why

The project can build the full application or standalone modules, but it does not yet provide a containerized production deployment for those outputs. A Node.js server using Fastify will provide a deployable Docker image while allowing the application mode to be selected through `VITE_APP_MODULE`.

## What Changes

- Add a Docker-based deployment for the Vue application, served by a Node.js Fastify server.
- Support deploying any module under `src/modules/` (currently `refill` and `stock`) when `VITE_APP_MODULE=<module>`, and the full application when the variable is unset. An unknown module fails the image build.
- Preserve client-side navigation, including direct requests to application routes.

## Capabilities

### New Capabilities
- `application-deployment`: Build and run the application in a Docker container, serve the selected application mode through Fastify, and fall back to the full application when no module is selected.

### Modified Capabilities

## Impact

- Docker image and container configuration.
- Node.js/Fastify production server.
- Existing Vite build outputs and `VITE_APP_MODULE` mode selection.