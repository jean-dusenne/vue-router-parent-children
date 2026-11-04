# vue-workflow-structure Specification

## Purpose

Defines the conventions for organising the Vue project by workflow (currently stock and refill, extensible to others), so contributors and agents place new code consistently and workflows stay decoupled.

## Requirements

### Requirement: Workflow-based source layout
The project SHALL group business modules under `src/modules/<module>/`, with one folder per bounded application module, currently `stock` and `refill`; the set of modules is open-ended. Each module SHALL own its URL prefix, top-level layout, and routes.

#### Scenario: New code for an existing workflow
- **WHEN** a contributor adds code that belongs only to the stock module
- **THEN** it is placed under `src/modules/stock/` and not in a technical-type folder at the `src/` root

#### Scenario: New workflow
- **WHEN** a new application module is introduced beyond stock and refill
- **THEN** it gets its own `src/modules/<module>/` folder with the same structure and rules, and its routes are aggregated by the application router

### Requirement: Standard Vue folders per workflow
Each module SHALL use the classic Vue folders `components/`, `composables/`, `stores/`, `views/` and `router/` for the matching kind of code, and SHALL create a folder only when it contains something.

#### Scenario: Workflow without a store
- **WHEN** the refill module has no state to manage
- **THEN** no `stores/` folder exists under `src/modules/refill/`

#### Scenario: Routed page
- **WHEN** a page or layout is mounted by a route
- **THEN** it is placed in the owning module's `views/` folder, and non-routed building blocks go in `components/`

### Requirement: Shared area for cross-workflow elements
Elements used by more than one module, or by a module and the application shell (`App.vue`, `src/router`), SHALL live under `src/shared/`, organised in `components/`, `composables/` and `stores/`.

#### Scenario: Element needed by two workflows
- **WHEN** a second module needs a component, composable or store that currently lives in the first module
- **THEN** it is moved to `src/shared/` and both modules import it from there

#### Scenario: Element needed by a workflow and the application shell
- **WHEN** the application shell needs a composable that currently lives in a module
- **THEN** it is moved to `src/shared/` and both the module and the application shell import it from there

### Requirement: Promotion to shared on actual reuse
An element SHALL stay in its module until a second consumer, another module or the application shell, actually needs it; it SHALL NOT be placed in `src/shared/` in anticipation of reuse.

#### Scenario: Speculative reuse
- **WHEN** a contributor builds a component used by only one module
- **THEN** it stays in that module even if it looks generic

### Requirement: No imports between workflows
A module SHALL NOT import code from another module. A module MAY import from `src/shared/`, and `src/shared/` SHALL NOT import from any module.

#### Scenario: Refill needs a stock helper
- **WHEN** code in `src/modules/refill/` needs something defined in `src/modules/stock/`
- **THEN** that element is first promoted to `src/shared/` and refill imports it from there

### Requirement: Routes owned by each workflow
Each module SHALL define and export its own routes and route guards from its `router/` folder. The application router SHALL aggregate routes through each module's public entry point and MAY define only app-level routes that belong to no module, such as `/`.

#### Scenario: Stock id guard
- **WHEN** a route guard applies only to stock routes
- **THEN** it is located in `src/modules/stock/router/` with the stock routes, not in the application router

#### Scenario: Adding a workflow route
- **WHEN** a new route is added to the refill module
- **THEN** it is declared in the refill module's routes and the application router needs no change beyond the existing aggregation

#### Scenario: App-level route
- **WHEN** a route belongs to no module, such as the root path `/`
- **THEN** it MAY be declared in the application router next to the aggregated module routes

### Requirement: Import style
Imports across modules and shared layers SHALL use the `@/` alias, and imports within the same module SHALL be relative.

#### Scenario: View importing a shared composable
- **WHEN** a view in a module uses a shared composable
- **THEN** it imports it through `@/shared/composables/...`

### Requirement: Skill discoverable by agents
The conventions SHALL be published as a project skill at `.github/skills/vue-module-structure/SKILL.md`, with a name and a description stating when it applies, and with the stock and refill modules as worked examples.

#### Scenario: Agent adds a feature
- **WHEN** an agent is asked to add Vue code for a module (stock, refill or a new one)
- **THEN** the skill's description lets it select the skill, and the skill tells it which folder to use

### Requirement: Module public entry point
Each module SHALL expose its routes and supported integration surface through a module-level `index.ts`; the application router SHALL compose modules through these public entry points rather than importing module internals.

#### Scenario: Application router composes a module
- **WHEN** the application router registers the stock routes
- **THEN** it imports the module's public export from `@/modules/stock` and does not import from `@/modules/stock/router/` directly

### Requirement: Subdomains stay inside their module
When a module grows, its subdomains and stepwise workflows SHALL remain nested under that module rather than becoming root-level modules solely because they form separate steps.

#### Scenario: Stock gains subdomains
- **WHEN** the stock module grows to include inventory and details subdomains
- **THEN** those subdomains are organized under `src/modules/stock/` and stock workflows remain internal to that module
