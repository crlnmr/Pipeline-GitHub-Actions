## ADDED Requirements

### Requirement: Webhook user.created sync

The system SHALL receive Clerk webhook events to synchronize users to the local database.

#### Scenario: Webhook user.created with valid signature

- **WHEN** Clerk sends a `user.created` webhook event with a valid signature
- **THEN** the system SHALL create a local User record with the Clerk userId and metadata

#### Scenario: Webhook user.created for existing user

- **WHEN** Clerk sends a `user.created` webhook event for an already-synchronized user
- **THEN** the system SHALL update the existing local User record (idempotent)

#### Scenario: Webhook with invalid signature

- **WHEN** a request to `POST /v1/auth/webhook` has an invalid or missing Clerk signature
- **THEN** the system SHALL return HTTP 401

### Requirement: POST /v1/auth/webhook endpoint

The system SHALL expose a webhook endpoint for Clerk events.

#### Scenario: Webhook endpoint is public

- **WHEN** Clerk sends a request to `POST /v1/auth/webhook`
- **THEN** the endpoint SHALL accept the request without JWT authentication (validated by Clerk signature instead)

### Requirement: User model

The system SHALL persist a local User record with Clerk synchronization data.

#### Scenario: User created with all required fields

- **WHEN** a User record is created via webhook
- **THEN** it SHALL contain: id (UUID), clerkId, email, name, role, createdAt, updatedAt

#### Scenario: User role defaults to CUSTOMER

- **WHEN** a User record is created without an explicit role
- **THEN** the role SHALL default to `CUSTOMER`
