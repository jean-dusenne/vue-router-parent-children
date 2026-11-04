# standalone-module-dev Specification

## Purpose

Lets a contributor run the whole application or a single module (Refill or Stock) from a dedicated npm script, with a single module served at the root URL and no module prefix.

## Requirements

### Requirement: Full-application dev script
The project SHALL provide an `npm run dev` script that serves the whole application. In this mode the module URLs SHALL keep their prefixes (`/stock`, `/refill`) and the application shell SHALL show the navigation between modules.

#### Scenario: Running the full application
- **WHEN** a contributor runs `npm run dev`
- **THEN** the application is served with `/` as an app-level page, the Stock module under `/stock` and the Refill module under `/refill`, and the shell navigation links to both modules

### Requirement: Refill standalone dev script
The project SHALL provide an `npm run dev:refill` script that serves only the Refill module at the root URL. No URL of the application, including links rendered by Refill itself, SHALL contain the `/refill` prefix.

#### Scenario: Opening the Refill root
- **WHEN** a contributor runs `npm run dev:refill`
- **THEN** the module is served at `/` and shows the Refill overview

#### Scenario: Navigating inside Refill
- **WHEN** the user follows a link to the settings of refill 42
- **THEN** the URL is `/42/settings` and the Refill settings page is shown

#### Scenario: Stock is not served
- **WHEN** the user browses to `/stock` while `npm run dev:refill` is running
- **THEN** no Stock page is shown

### Requirement: Stock standalone dev script
The project SHALL provide an `npm run dev:stock` script that serves only the Stock module at the root URL. No URL of the application, including links rendered by Stock itself, SHALL contain the `/stock` prefix.

#### Scenario: Opening the Stock root
- **WHEN** a contributor runs `npm run dev:stock`
- **THEN** the module is served at `/` and shows the Stock directory

#### Scenario: Navigating inside Stock
- **WHEN** the user follows a link to the details of stock 42
- **THEN** the URL is `/42` and the Stock details page is shown

#### Scenario: Stock guard still applies
- **WHEN** the user follows the link to stock 404
- **THEN** the URL is `/404` and the stock id guard error is shown

### Requirement: Single-module mode hides module navigation
When a single module is served, the application shell SHALL NOT show the navigation between modules.

#### Scenario: Shell in standalone mode
- **WHEN** the application runs through `npm run dev:refill` or `npm run dev:stock`
- **THEN** the shell shows no Stock/Refill navigation links

### Requirement: Default URLs unchanged
Outside the standalone dev scripts, including builds, the module URLs SHALL remain `/stock` and `/refill`.

#### Scenario: Production build
- **WHEN** the application is built and served without a standalone mode
- **THEN** Stock is reachable under `/stock` and Refill under `/refill`
