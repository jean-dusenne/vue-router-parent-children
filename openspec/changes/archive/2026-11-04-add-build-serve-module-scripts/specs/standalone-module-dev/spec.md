## ADDED Requirements

### Requirement: Standalone build scripts
The project SHALL provide `npm run build:refill` and `npm run build:stock` scripts that produce a production build in standalone mode that contains the pages of only that module. The project SHALL keep `npm run build` for the whole application. Each build SHALL be written to its own output location, so that building one mode never overwrites or removes the build of another mode.

#### Scenario: Building a single module
- **WHEN** a contributor runs `npm run build:refill`
- **THEN** a production build is produced that contains the Refill pages and none of the Stock pages, with Refill at the root URL

#### Scenario: Builds do not overwrite each other
- **WHEN** a contributor runs `npm run build:refill`, then `npm run build:stock`, then `npm run build`
- **THEN** the three builds exist side by side and each can still be served

### Requirement: Serve scripts for built output
The project SHALL provide `npm run serve:refill`, `npm run serve:stock` and `npm run serve` scripts. Each SHALL serve the build of its own mode, without rebuilding it. Direct navigation to any route of the served mode SHALL show that route's page, not a not-found error from the server.

#### Scenario: Serving the Refill build
- **WHEN** a contributor runs `npm run serve:refill` after `npm run build:refill`
- **THEN** the Refill module is served at `/`, with no `/refill` prefix in any URL and no module navigation in the shell

#### Scenario: Serving the Stock build
- **WHEN** a contributor runs `npm run serve:stock` after `npm run build:stock`
- **THEN** the Stock module is served at `/`, with no `/stock` prefix in any URL and no module navigation in the shell

#### Scenario: Serving the default build
- **WHEN** a contributor runs `npm run serve` after `npm run build`
- **THEN** the whole application is served with Stock under `/stock`, Refill under `/refill` and the shell navigation linking to both

#### Scenario: Reloading a deep link
- **WHEN** a contributor opens `/42/settings` directly in the browser while `npm run serve:refill` is running
- **THEN** the Refill settings page of refill 42 is shown

#### Scenario: Serving a mode that was not built
- **WHEN** a contributor runs a serve script before the build of its mode exists
- **THEN** the script fails with a clear indication that the build is missing, and does not serve another mode's build
