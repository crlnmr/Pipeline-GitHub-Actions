## ADDED Requirements

### Requirement: POST /v1/auth/sign-in

The system SHALL authenticate a user with email and password credentials via the Clerk API.

#### Scenario: Successful sign-in

- **WHEN** a user submits valid email and password to `POST /v1/auth/sign-in`
- **THEN** the system SHALL return HTTP 200 with a session token set as httpOnly cookie

#### Scenario: Sign-in with invalid credentials

- **WHEN** a user submits invalid email or password to `POST /v1/auth/sign-in`
- **THEN** the system SHALL return HTTP 401 with a Problem Details response (RFC 9457)

#### Scenario: Sign-in with missing fields

- **WHEN** a user submits a request with missing email or password
- **THEN** the system SHALL return HTTP 400 with validation error details

### Requirement: POST /v1/auth/sign-up

The system SHALL register a new user via the Clerk API and create a local User record.

#### Scenario: Successful sign-up

- **WHEN** a user submits email, password, and name to `POST /v1/auth/sign-up`
- **THEN** the system SHALL return HTTP 201 with user data (without password)

#### Scenario: Sign-up with existing email

- **WHEN** a user submits sign-up with an email already registered in Clerk
- **THEN** the system SHALL return HTTP 409 with a Problem Details response

#### Scenario: Sign-up with invalid data

- **WHEN** a user submits sign-up with invalid email format or weak password
- **THEN** the system SHALL return HTTP 400 with validation error details

### Requirement: Clerk SDK secret key validation

The system SHALL validate Clerk API secret key is configured on startup.

#### Scenario: Missing Clerk secret key

- **WHEN** the backend starts without `CLERK_SECRET_KEY` environment variable
- **THEN** the system SHALL log an error and fail to start the auth module
