## ADDED Requirements

### Requirement: JwtAuthGuard

The system SHALL validate Clerk JWT tokens on protected routes.

#### Scenario: Request with valid token

- **WHEN** a request includes a valid Clerk JWT token in the httpOnly cookie
- **THEN** the guard SHALL allow the request to proceed

#### Scenario: Request without token

- **WHEN** a request has no JWT token
- **THEN** the guard SHALL return HTTP 401 with a Problem Details response

#### Scenario: Request with expired token

- **WHEN** a request includes an expired Clerk JWT token
- **THEN** the guard SHALL return HTTP 401 with a Problem Details response

#### Scenario: Request with malformed token

- **WHEN** a request includes a malformed or invalid JWT token
- **THEN** the guard SHALL return HTTP 401 with a Problem Details response

### Requirement: @Public() decorator

The system SHALL allow marking routes as publicly accessible.

#### Scenario: Public route accessed without token

- **WHEN** a route decorated with `@Public()` is accessed without a JWT token
- **THEN** the guard SHALL allow the request to proceed

### Requirement: @CurrentUser() decorator

The system SHALL inject the authenticated user data into controller methods.

#### Scenario: Authenticated route with @CurrentUser()

- **WHEN** a controller method uses `@CurrentUser()` parameter decorator
- **THEN** the system SHALL inject the user object extracted from the JWT

#### Scenario: Public route with @CurrentUser()

- **WHEN** a public route uses `@CurrentUser()` but no user is authenticated
- **THEN** the system SHALL inject `undefined`

### Requirement: @Roles() decorator

The system SHALL restrict route access based on user roles.

#### Scenario: ADMIN route with ADMIN user

- **WHEN** a user with `ADMIN` role accesses a route decorated with `@Roles('ADMIN')`
- **THEN** the request SHALL be allowed

#### Scenario: ADMIN route with CUSTOMER user

- **WHEN** a user with `CUSTOMER` role accesses a route decorated with `@Roles('ADMIN')`
- **THEN** the system SHALL return HTTP 403 with a Problem Details response

#### Scenario: ADMIN route with unauthenticated user

- **WHEN** an unauthenticated user accesses a route decorated with `@Roles('ADMIN')`
- **THEN** the system SHALL return HTTP 401 with a Problem Details response
