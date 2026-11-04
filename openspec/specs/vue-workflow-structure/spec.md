# vue-workflow-structure Specification

## Purpose

Defines the conventions for organising the Vue project by workflow (currently stock and refill, extensible to others), so contributors and agents place new code consistently and workflows stay decoupled.

## Requirements

### Requirement: Workflow-based source layout
The project SHALL group workflow code under `src/workflows/<workflow>/`, with one folder per business workflow, currently `stock` and `refill`; the set of workflows is open-ended.

#### Scenario: New code for an existing workflow
- **WHEN** a contributor adds code that belongs only to the stock workflow
- **THEN** it is placed under `src/workflows/stock/` and not in a technical-type folder at the `src/` root

#### Scenario: New workflow
- **WHEN** a new business workflow is introduced beyond stock and refill
- **THEN** it gets its own `src/workflows/<workflow>/` folder with the same structure and rules, and its routes are aggregated by the application router

### Requirement: Standard Vue folders per workflow
Each workflow SHALL use the classic Vue folders `components/`, `composables/`, `stores/`, `views/` and `router/` for the matching kind of code, and SHALL create a folder only when it contains something.

#### Scenario: Workflow without a store
- **WHEN** the refill workflow has no state to manage
- **THEN** no `stores/` folder exists under `src/workflows/refill/`

#### Scenario: Routed page
- **WHEN** a page or layout is mounted by a route
- **THEN** it is placed in the workflow's `views/` folder, and non-routed building blocks go in `components/`

### Requirement: Shared area for cross-workflow elements
Elements used by more than one workflow SHALL live under `src/shared/`, organised in `components/`, `composables/` and `stores/`.

#### Scenario: Element needed by two workflows
- **WHEN** a second workflow needs a component, composable or store that currently lives in the first workflow
- **THEN** it is moved to `src/shared/` and both workflows import it from there

### Requirement: Promotion to shared on actual reuse
An element SHALL stay in its workflow until a second workflow actually needs it; it SHALL NOT be placed in `src/shared/` in anticipation of reuse.

#### Scenario: Speculative reuse
- **WHEN** a contributor builds a component used by only one workflow
- **THEN** it stays in that workflow even if it looks generic

### Requirement: No imports between workflows
A workflow SHALL NOT import code from another workflow. A workflow MAY import from `src/shared/`, and `src/shared/` SHALL NOT import from any workflow.

#### Scenario: Refill needs a stock helper
- **WHEN** code in `src/workflows/refill/` needs something defined in `src/workflows/stock/`
- **THEN** that element is first promoted to `src/shared/` and refill imports it from there

### Requirement: Routes owned by each workflow
Each workflow SHALL define and export its own routes and route guards from its `router/` folder, and the application router SHALL only aggregate the routes exported by the workflows.

#### Scenario: Stock id guard
- **WHEN** a route guard applies only to stock routes
- **THEN** it is located in `src/workflows/stock/router/` with the stock routes, not in the application router

#### Scenario: Adding a workflow route
- **WHEN** a new route is added to the refill workflow
- **THEN** it is declared in the refill workflow's routes and the application router file needs no change beyond the existing aggregation

### Requirement: Import style
Imports across layers SHALL use the `@/` alias (for example `@/shared/composables/...`), and imports within the same workflow SHALL be relative.

#### Scenario: View importing a shared composable
- **WHEN** a view in a workflow uses a shared composable
- **THEN** it imports it through `@/shared/composables/...`

### Requirement: Skill discoverable by agents
The conventions SHALL be published as a project skill at `.github/skills/vue-workflow-structure/SKILL.md`, with a name and a description stating when it applies, and with the stock and refill code of this project as worked examples.

#### Scenario: Agent adds a feature
- **WHEN** an agent is asked to add Vue code for a workflow (stock, refill or a new one)
- **THEN** the skill's description lets it select the skill, and the skill tells it which folder to use
