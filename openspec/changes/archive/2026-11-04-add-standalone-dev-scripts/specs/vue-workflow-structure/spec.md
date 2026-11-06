# Spec Delta

## MODIFIED Requirements

### Requirement: Routes owned by each workflow
Each module SHALL define and export its own routes and route guards from its `router/` folder. A module's routes SHALL be built for a URL prefix that the application router supplies, defaulting to the module's own prefix (`/stock`, `/refill`), and a module SHALL NOT hard-code its prefix in links to its own routes. The application router SHALL aggregate routes through each module's public entry point and MAY define only app-level routes that belong to no module, such as `/`.

#### Scenario: Stock id guard
- **WHEN** a route guard applies only to stock routes
- **THEN** it is located in `src/modules/stock/router/` with the stock routes, not in the application router

#### Scenario: Adding a workflow route
- **WHEN** a new route is added to the refill module
- **THEN** it is declared in the refill module's routes and the application router needs no change beyond the existing aggregation

#### Scenario: App-level route
- **WHEN** a route belongs to no module, such as the root path `/`
- **THEN** it MAY be declared in the application router next to the aggregated module routes

#### Scenario: Module mounted without prefix
- **WHEN** the application router mounts a module with an empty prefix
- **THEN** the module's routes and its internal links resolve at the root URL without any change inside the module

#### Scenario: Internal link
- **WHEN** a view of a module links to another route of the same module
- **THEN** it targets the route by name rather than by a path containing the module prefix
