# Spec Delta

## Purpose

Provides deployable container images for Refill, Stock, and the complete Vue application, with the selected application mode fixed when each image is built.

## ADDED Requirements

### Requirement: Container image uses the selected application mode
Each production container image SHALL contain and serve the application mode selected by `VITE_APP_MODULE` during image construction. When the variable is unset, the image SHALL contain and serve the full application.

#### Scenario: Build a Refill image
- **WHEN** a production image is built with `VITE_APP_MODULE=refill` and started
- **THEN** it serves only the Refill module at the root URL, without a `/refill` prefix

#### Scenario: Build a Stock image
- **WHEN** a production image is built with `VITE_APP_MODULE=stock` and started
- **THEN** it serves only the Stock module at the root URL, without a `/stock` prefix

#### Scenario: Build the full-application image
- **WHEN** a production image is built without `VITE_APP_MODULE` and started
- **THEN** it serves Stock under `/stock` and Refill under `/refill`, with navigation between both modules

### Requirement: Unknown application mode is rejected
The image build SHALL fail when `VITE_APP_MODULE` does not name an existing application module. A module added later SHALL be accepted without changing the deployment configuration.

#### Scenario: Unknown module
- **WHEN** a production image is built with `VITE_APP_MODULE=unknown`
- **THEN** the build fails and no image is produced

#### Scenario: Module added later
- **WHEN** a new application module is added and an image is built with its name as `VITE_APP_MODULE`
- **THEN** the image serves only that module at the root URL

### Requirement: Direct navigation resolves client-side routes
The container SHALL return the application entry point for valid client-side routes that are not static assets, allowing the client router to render the requested page after direct navigation or reload.

#### Scenario: Open a Refill route directly
- **WHEN** a browser requests `/42/settings` directly from a Refill image
- **THEN** the Refill settings page for refill 42 is rendered

#### Scenario: Open a Stock route directly
- **WHEN** a browser requests `/42` directly from a Stock image
- **THEN** the Stock details page for stock 42 is rendered

#### Scenario: Open a full-application module route directly
- **WHEN** a browser requests `/stock` directly from a full-application image
- **THEN** the Stock directory page is rendered