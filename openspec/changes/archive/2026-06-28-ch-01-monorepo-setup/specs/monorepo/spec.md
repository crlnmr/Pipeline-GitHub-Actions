## ADDED Requirements

### Requirement: Monorepo Structure with npm Workspaces
The system SHALL be structured as a monorepo using npm workspaces. The root `package.json` MUST define workspaces for `apps/frontend` and `apps/backend`.

#### Scenario: Root package.json configures workspaces
- **WHEN** the root `package.json` is inspected
- **THEN** it MUST contain a `workspaces` field specifying `["apps/frontend", "apps/backend"]`
