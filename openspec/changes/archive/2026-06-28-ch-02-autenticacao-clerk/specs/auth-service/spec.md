## ADDED Requirements

### Requirement: Frontend AuthService

The system SHALL provide a frontend service layer for authentication API communication.

#### Scenario: AuthService.signIn

- **WHEN** AuthService.signIn(email, password) is called
- **THEN** it SHALL POST to `/api/v1/auth/sign-in` with the credentials

#### Scenario: AuthService.signUp

- **WHEN** AuthService.signUp(email, password, name) is called
- **THEN** it SHALL POST to `/api/v1/auth/sign-up` with the user data

#### Scenario: AuthService handles 401 response

- **WHEN** the backend returns HTTP 401
- **THEN** AuthService SHALL throw an AuthError with the server error message

#### Scenario: AuthService handles network error

- **WHEN** the network request fails
- **THEN** AuthService SHALL throw an AuthError with "Erro de conexão" message

### Requirement: AuthService.getCurrentUser

The system SHALL provide a method to fetch the current authenticated user.

#### Scenario: Authenticated user fetch

- **WHEN** AuthService.getCurrentUser() is called with a valid session
- **THEN** it SHALL return the current user data

#### Scenario: Unauthenticated user fetch

- **WHEN** AuthService.getCurrentUser() is called without a session
- **THEN** it SHALL return null
