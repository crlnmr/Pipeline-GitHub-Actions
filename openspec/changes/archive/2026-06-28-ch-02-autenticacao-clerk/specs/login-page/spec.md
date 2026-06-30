## ADDED Requirements

### Requirement: Login page at /login

The system SHALL render a login page with custom form (no Clerk components).

#### Scenario: Login page renders form fields

- **WHEN** a user navigates to `/login`
- **THEN** the page SHALL render email input, password input, and "Entrar" submit button

#### Scenario: Login page shows "Criar conta" link

- **WHEN** a user navigates to `/login`
- **THEN** the page SHALL render a "Criar conta" link/button

#### Scenario: Login page redirects authenticated users

- **WHEN** an already authenticated user navigates to `/login`
- **THEN** the system SHALL redirect to the home page `/`

### Requirement: Form validation

The login form SHALL validate inputs before submission.

#### Scenario: Empty email shows error

- **WHEN** a user submits the form with an empty email field
- **THEN** the form SHALL display a "Email é obrigatório" error message

#### Scenario: Empty password shows error

- **WHEN** a user submits the form with an empty password field
- **THEN** the form SHALL display a "Senha é obrigatória" error message

#### Scenario: Invalid email format shows error

- **WHEN** a user submits the form with an improperly formatted email
- **THEN** the form SHALL display a "Email inválido" error message

### Requirement: Login error display

The system SHALL display backend errors on the login page.

#### Scenario: Invalid credentials error

- **WHEN** the backend returns 401 for invalid credentials
- **THEN** the login page SHALL display "Email ou senha inválidos" error message

#### Scenario: Server error

- **WHEN** the backend returns a 5xx error
- **THEN** the login page SHALL display "Erro interno do servidor. Tente novamente." error message

### Requirement: Login design tokens

The login page SHALL follow the Nike-design-analysis design system.

#### Scenario: Login page uses ink and canvas tokens

- **WHEN** the login page is rendered
- **THEN** text SHALL use the ink (#111111) token and background SHALL use canvas (#ffffff)

#### Scenario: Submit button is pill-shaped

- **WHEN** the "Entrar" button is rendered
- **THEN** it SHALL have border-radius: 9999px (pill shape)

#### Scenario: Responsive layout

- **WHEN** the login page is viewed on mobile (≤599px)
- **THEN** the form SHALL be full-width with adequate touch targets (≥44px)
