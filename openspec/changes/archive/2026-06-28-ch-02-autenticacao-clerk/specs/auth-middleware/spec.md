## ADDED Requirements

### Requirement: Next.js middleware for route protection

The system SHALL redirect unauthenticated users to the login page for protected routes.

#### Scenario: Unauthenticated user accesses protected route

- **WHEN** an unauthenticated user navigates to `/dashboard` or any protected route
- **THEN** the middleware SHALL redirect to `/login`

#### Scenario: Authenticated user accesses protected route

- **WHEN** an authenticated user navigates to a protected route
- **THEN** the middleware SHALL allow the request to proceed

#### Scenario: Public routes are accessible without auth

- **WHEN** any user (authenticated or not) navigates to `/`, `/catalogo`, or `/login`
- **THEN** the middleware SHALL allow the request to proceed

### Requirement: Middleware route configuration

The system SHALL define a configurable list of public and protected routes.

#### Scenario: Public routes matcher

- **WHEN** the middleware configuration is inspected
- **THEN** it SHALL include an allowlist of public routes that bypass authentication

#### Scenario: Protected routes matcher

- **WHEN** the middleware configuration is inspected
- **THEN** it SHALL include routes that require authentication

### Requirement: Middleware cookie validation

The system SHALL validate the session cookie in the middleware.

#### Scenario: Valid session cookie

- **WHEN** a request includes a valid session cookie
- **THEN** the middleware SHALL recognize the user as authenticated

#### Scenario: Invalid or expired session cookie

- **WHEN** a request includes an invalid or expired session cookie
- **THEN** the middleware SHALL treat the user as unauthenticated and redirect to `/login`
