# Spec Delta

## Purpose

Defines how application source is organized by business workflow and feature, how each unit exposes a public entry point, and which dependencies between units are allowed and enforced by lint.

## ADDED Requirements

### Requirement: Source is organized by workflow and feature
The system SHALL group business code under `src/workflows/<workflow>/features/<feature>/`, with application bootstrap and routing assembly under `src/app/`. Technical segments (views, components, stores, api, model) SHALL exist at feature level only.

#### Scenario: Stock and refill workflows exist
- **WHEN** the source tree is inspected
- **THEN** `workflows/stock` contains the features `directory` and `details`, and `workflows/refill` contains the features `overview` and `settings`

#### Scenario: Workflow layout holds the parent route component
- **WHEN** a workflow defines a parent route
- **THEN** its parent component lives in `workflows/<workflow>/layout/` and not in a feature

#### Scenario: Feature-owned logic stays with its feature
- **WHEN** route logic applies to a single feature, such as validation of the stock id
- **THEN** it is placed inside that feature and not in `src/app/`

### Requirement: Workflows and features expose a single public entry point
Each workflow and each feature SHALL expose an `index.ts` as its only public entry point. An entry point SHALL export routes and any stores, composables or types meant for consumers, and SHALL NOT re-export views or components.

#### Scenario: Entry point exposes routes only through lazy components
- **WHEN** the application loads without visiting any workflow route
- **THEN** no view component of a workflow or feature is loaded eagerly

#### Scenario: Application router consumes workflows
- **WHEN** the application router is built
- **THEN** it assembles `stockRoutes` and `refillRoutes` from the workflow entry points and imports nothing else from a workflow

### Requirement: Route composition preserves existing navigation
Each workflow SHALL compose its features' child routes under its lazy parent layout. The resulting URLs, route metadata, guards and rendered pages SHALL be identical to the behavior before the reorganization.

#### Scenario: Routes resolve unchanged
- **WHEN** `/stock`, `/stock/42`, `/refill` and `/refill/42/settings` are resolved
- **THEN** each resolves to the same matched paths, props setting and title metadata as before the reorganization

#### Scenario: Stock id guard still blocks id 404
- **WHEN** navigation targets `/stock/404`
- **THEN** it is rejected with the error `Stock ID 404 not found`, both on first entry and when changing from another stock id

### Requirement: Import boundaries are enforced by lint
The linter SHALL fail on imports of workflow internals from outside their workflow, and on imports of the application layer from a workflow. Cross-workflow imports SHALL use the target workflow's entry point only.

#### Scenario: Deep import into a workflow is rejected
- **WHEN** code outside `workflows/stock`, including another workflow, imports a file below the `workflows/stock` root
- **THEN** lint reports an error

#### Scenario: Workflow importing the application layer is rejected
- **WHEN** a file under `workflows/` imports from `src/app/`
- **THEN** lint reports an error

#### Scenario: Import through a workflow entry point is accepted
- **WHEN** application code or another workflow imports `@/workflows/<workflow>`
- **THEN** lint reports no boundary error

### Requirement: Workflows do not import each other circularly
Dependencies between workflows SHALL be one-directional. The project SHALL contain no circular dependency between workflows or between features.

#### Scenario: Current workflows are independent
- **WHEN** imports between `workflows/stock` and `workflows/refill` are inspected
- **THEN** neither workflow imports the other
