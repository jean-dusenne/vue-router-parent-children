# Spec Delta

## MODIFIED Requirements

### Requirement: Shared area for cross-workflow elements
Elements used by more than one workflow, or by a workflow and the application shell (`App.vue`, `src/router`), SHALL live under `src/shared/`, organised in `components/`, `composables/` and `stores/`.

#### Scenario: Element needed by two workflows
- **WHEN** a second workflow needs a component, composable or store that currently lives in the first workflow
- **THEN** it is moved to `src/shared/` and both workflows import it from there

#### Scenario: Element needed by a workflow and the application shell
- **WHEN** the application shell needs a composable that currently lives in a workflow
- **THEN** it is moved to `src/shared/` and both the workflow and the application shell import it from there

### Requirement: Promotion to shared on actual reuse
An element SHALL stay in its workflow until a second consumer, another workflow or the application shell, actually needs it; it SHALL NOT be placed in `src/shared/` in anticipation of reuse.

#### Scenario: Speculative reuse
- **WHEN** a contributor builds a component used by only one workflow
- **THEN** it stays in that workflow even if it looks generic

### Requirement: Routes owned by each workflow
Each workflow SHALL define and export its own routes and route guards from its `router/` folder. The application router SHALL aggregate the routes exported by the workflows and MAY define only app-level routes that belong to no workflow, such as `/`.

#### Scenario: Stock id guard
- **WHEN** a route guard applies only to stock routes
- **THEN** it is located in `src/workflows/stock/router/` with the stock routes, not in the application router

#### Scenario: Adding a workflow route
- **WHEN** a new route is added to the refill workflow
- **THEN** it is declared in the refill workflow's routes and the application router file needs no change beyond the existing aggregation

#### Scenario: App-level route
- **WHEN** a route belongs to no workflow, such as the root path `/`
- **THEN** it MAY be declared in the application router next to the aggregated workflow routes
