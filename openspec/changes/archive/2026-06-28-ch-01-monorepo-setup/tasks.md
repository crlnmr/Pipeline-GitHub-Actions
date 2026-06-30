## 1. Root Monorepo Setup

- [x] 1.1 Create root `package.json` with `workspaces: ["apps/frontend", "apps/backend"]` and shared scripts (build, dev, lint, test)
- [x] 1.2 Create root `.gitignore` (node_modules, .env, dist, .next, coverage, prisma/*.db)
- [x] 1.3 Create root `tsconfig.base.json` with shared TypeScript configuration
- [x] 1.4 Create root `.env` with DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY placeholders
- [x] 1.5 Create root `.prettierrc` and `.editorconfig` shared formatting configs

## 2. Docker Compose — PostgreSQL

- [x] 2.1 Create `docker-compose.yml` with PostgreSQL 15 service (port 5433, volume, healthcheck)
- [x] 2.2 Create `.docker/postgres/init.sql` placeholder for future initialization needs

## 3. Backend — NestJS Scaffold

- [x] 3.1 Scaffold NestJS 11+ app in `apps/backend` using NestJS CLI with TypeScript
- [x] 3.2 Create `apps/backend/src/core/` directory (auth, database, observability, audit subdirs)
- [x] 3.3 Create `apps/backend/src/modules/` directory (catalog, orders, customers subdirs)
- [x] 3.4 Implement `GET /v1/health` endpoint returning `{ status: "ok" }` in `health.controller.ts`
- [x] 3.5 Register HealthModule in AppModule
- [x] 3.6 Configure Prisma 7+ with `prisma/schema.prisma` and PostgreSQL provider
- [x] 3.7 Create initial Prisma migration (bootstrap with no domain entities yet)
- [x] 3.8 Add backend ESLint config extending root shared config

## 4. Frontend — Next.js Scaffold

- [x] 4.1 Scaffold Next.js 16+ app in `apps/frontend` with App Router and TypeScript
- [x] 4.2 Create placeholder homepage (`app/page.tsx`) with "e-micro-commerce" branding
- [x] 4.3 Set up global CSS with design tokens (ink, canvas, soft-cloud, sale, success, info colors)
- [x] 4.4 Configure frontend ESLint extending root shared config
- [x] 4.5 Add `services/` directory placeholder for future API integration layer

## 5. Toolchain — Quality & Testing

- [x] 5.1 Configure shared ESLint config at root `eslint.config.js` (or `.eslintrc`) with TypeScript rules
- [x] 5.2 Configure Jest in backend with `@nestjs/testing`, Supertest, and coverage thresholds (80% lines/branches)
- [x] 5.3 Write backend smoke test: AppModule loads without errors
- [x] 5.4 Write backend integration test: `GET /v1/health` returns 200
- [x] 5.5 Write backend integration test: `GET /v1/health` returns 503 when DB is down
- [x] 5.6 Configure Jest in frontend with React Testing Library and coverage thresholds (70% lines/branches)
- [x] 5.7 Write frontend smoke test: HomePage renders without crash
- [x] 5.8 Configure Playwright for E2E tests in `apps/frontend`
- [x] 5.9 Write Playwright smoke test: homepage loads with status 200 and expected title
- [x] 5.10 Configure `npm run test:e2e` script at root level

## 6. Verification

- [x] 6.1 Run `npm run lint` across all workspaces — zero errors
- [x] 6.2 Run `npm run test --workspace=backend` — all green, coverage ≥ 80%
- [x] 6.3 Run `npm run test --workspace=frontend` — all green, coverage ≥ 70%
- [ ] 6.4 Run `npm run test:e2e` — all green
- [x] 6.5 Verify `docker compose up -d db` starts PostgreSQL on port 5433
- [x] 6.6 Verify Prisma migration runs without errors
