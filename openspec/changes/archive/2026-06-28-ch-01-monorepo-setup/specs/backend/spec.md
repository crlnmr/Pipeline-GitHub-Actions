## ADDED Requirements

### Requirement: NestJS Backend Scaffold
The backend application SHALL be scaffolded using NestJS 11+ with TypeScript. It must include a basic `AppModule`, a health check endpoint (`GET /v1/health`), and a standard directory structure for `core/` and `modules/`.

#### Scenario: NestJS project structure is created
- **WHEN** the backend application is scaffolded
- **THEN** it MUST adhere to NestJS conventions with `src/` directory containing `app.module.ts`, `main.ts`, and a `health.controller.ts`.

#### Scenario: Health check endpoint returns OK
- **WHEN** a GET request is made to `/v1/health`
- **THEN** the system MUST return a 200 status code with a JSON body `{ status: "ok" }`.

#### Scenario: Core and Modules directories exist
- **WHEN** the backend application is scaffolded
- **THEN** the `src/` directory MUST contain `core/` and `modules/` subdirectories.
