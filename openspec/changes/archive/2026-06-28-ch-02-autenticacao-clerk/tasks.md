## 1. Backend: Prisma User Model

- [x] 1.1 Add `User` model to Prisma schema (id UUID, clerkId, email, name, role enum, createdAt, updatedAt)
- [x] 1.2 Generate and run Prisma migration
- [x] 1.3 Add `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` to `.env.example`

## 2. Backend: Auth Module Core

- [x] 2.1 Generate `core/auth` module via NestJS CLI
- [x] 2.2 Install `@clerk/clerk-sdk-node` dependency
- [x] 2.3 Create `AuthService` with Clerk client initialization (with startup validation)
- [x] 2.4 Implement `AuthService.signIn(email, password)` consuming Clerk API
- [x] 2.5 Implement `AuthService.signUp(email, password, name)` consuming Clerk API
- [x] 2.6 Implement `AuthService.validateToken(token)` returning user data from JWT

## 3. Backend: Auth Endpoints

- [x] 3.1 Create `AuthController` with routes `POST /v1/auth/sign-in` and `POST /v1/auth/sign-up`
- [x] 3.2 Implement sign-in response with httpOnly cookie (secure, sameSite strict)
- [x] 3.3 Implement DTOs with class-validator for sign-in and sign-up requests
- [x] 3.4 Implement error handling returning RFC 9457 Problem Details
- [x] 3.5 Apply `@Public()` decorator to auth endpoints

## 4. Backend: Guards and Decorators

- [x] 4.1 Implement `JwtAuthGuard` (global guard) validating Clerk JWT via JWKS
- [x] 4.2 Implement `@Public()` decorator to bypass global guard
- [x] 4.3 Implement `@CurrentUser()` parameter decorator extracting user from request
- [x] 4.4 Implement `@Roles(...roles)` decorator with RolesGuard checking user role
- [x] 4.5 Register `JwtAuthGuard` as global guard in the AppModule

## 5. Backend: Clerk Webhook

- [x] 5.1 Add `POST /v1/auth/webhook` endpoint in `AuthController`
- [x] 5.2 Implement webhook signature verification using Clerk SDK
- [x] 5.3 Implement `user.created` event handler creating local User record
- [x] 5.4 Implement idempotent upsert logic for webhook events
- [x] 5.5 Implement Prisma `UserService` or repository for user persistence

## 6. Frontend: Auth Service

- [x] 6.1 Create `services/auth.service.ts` with `signIn(email, password)` method
- [x] 6.2 Add `signUp(email, password, name)` and `getCurrentUser()` methods
- [x] 6.3 Implement error handling for 401, 4xx, 5xx, and network errors
- [x] 6.4 Create `AuthError` class for typed error handling

## 7. Frontend: Login Page

- [x] 7.1 Create page at `app/login/page.tsx` with email input, password input, and "Entrar" button
- [x] 7.2 Implement form validation (empty fields, email format) with inline error messages
- [x] 7.3 Implement `handleSubmit` calling `auth.service.ts signIn`
- [x] 7.4 Display backend error messages on form (invalid credentials, server error)
- [x] 7.5 Add "Criar conta" link/button for navigation
- [x] 7.6 Redirect authenticated users away from `/login` to home
- [x] 7.7 Style login page per Nike-design-analysis tokens (ink, canvas, pill button, responsive)

## 8. Frontend: Next.js Middleware

- [x] 8.1 Create `middleware.ts` at root of frontend
- [x] 8.2 Implement session cookie check to determine auth status
- [x] 8.3 Configure public routes allowlist (/, /catalogo, /login)
- [x] 8.4 Redirect unauthenticated users to `/login` for protected routes

## 9. Tests

- [x] 9.1 Write unit tests for `AuthService.signIn()` — success and failure cases
- [x] 9.2 Write unit tests for `AuthService.signUp()` — success and failure cases
- [x] 9.3 Write unit tests for `JwtAuthGuard` — valid token, no token, expired token, malformed token
- [x] 9.4 Write unit tests for `@Roles()` decorator — ADMIN access, CUSTOMER denied
- [x] 9.5 Write unit tests for `@CurrentUser()` decorator — authenticated and anonymous
- [x] 9.6 Write integration tests for `POST /v1/auth/sign-in` — 200 and 401 responses
- [x] 9.7 Write integration tests for `POST /v1/auth/sign-up` — 201 and 409 responses
- [x] 9.8 Write integration tests for protected routes without token — 401 Problem Details
- [x] 9.9 Write integration tests for role-protected routes — 403 Problem Details
- [x] 9.10 Write unit tests for frontend `LoginPage` — renders fields, shows errors
- [x] 9.11 Write E2E test for login flow — fill credentials, submit, redirect
- [x] 9.12 Write E2E test for protected route redirect without login
- [x] 9.13 Write E2E test for invalid credentials error display

## 10. Quality & Finish

- [x] 10.1 Run `npm run lint` on both workspaces and fix all issues
- [x] 10.2 Run all tests and verify coverage ≥80% backend / ≥70% frontend
- [x] 10.3 Remove any orphan imports, variables, and dead code
