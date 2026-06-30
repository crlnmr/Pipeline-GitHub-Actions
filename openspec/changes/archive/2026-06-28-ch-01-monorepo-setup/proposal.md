# CH-01 — Monorepo Setup & Infraestrutura Base

## Descrição

Inicialização do monorepo npm Workspaces com as configurações base de backend (NestJS 11+), frontend (Next.js 16+), banco de dados (PostgreSQL via Docker Compose) e ferramentas de qualidade (ESLint, Jest, Playwright). Sem nenhuma funcionalidade de negócio — apenas o esqueleto do projeto funcionando.

## RFs e RNFs Afetados

- **RNF-04** Escalabilidade (containers OCI)
- **RNF-05** Portabilidade (Docker Compose local)
- **RNF-06** Testabilidade (toolchain de testes configurado)

## Non-goals

- Nenhuma entidade de domínio, endpoint ou tela de negócio.
- Sem autenticação (Clerk) — configurada na CH-02.
- Sem observabilidade (OpenTelemetry/Pino) — configurada na CH-03.
- Sem infraestrutura Terraform — na CH-11.

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Monorepo | `package.json` raiz com `npm workspaces` (`apps/frontend`, `apps/backend`) |
| Backend | Scaffold NestJS 11+ com `AppModule`, saúde (`GET /v1/health`) e estrutura `core/` + `modules/` |
| Frontend | Scaffold Next.js 16+ App Router com página placeholder `/` |
| Banco | `docker-compose.yml` com PostgreSQL 15, `prisma/schema.prisma` inicial e migration de bootstrap |
| Qualidade | ESLint (shared config), Jest (unit + integration) e Playwright (E2E) configurados e passando com testes de smoke |
| Variáveis | `.env` único na raiz com todas as variáveis necessárias |

## Dependências

- Nenhuma mudança anterior necessária (ponto de partida).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Versões de pacotes NestJS 11+ / Next.js 16+ com breaking changes | Baixa | Fixar versões exatas no `package.json` |
| Conflito de porta Docker entre ambientes de dev | Baixa | Usar porta 5433 no Compose para evitar conflitos |
| `.env` exposto acidentalmente | Baixa | `.gitignore` configurado desde o início |

## Execução de Linter

```bash
npm run lint        # ESLint em todos os workspaces
```

Critério: zero erros ou warnings bloqueantes.

## Testes Unitários

| Escopo | Teste |
|---|---|
| Backend `AppModule` | Módulo carrega sem erros |
| Backend `GET /v1/health` | Retorna `200 { status: "ok" }` |
| Frontend `HomePage` | Renderiza sem crash (React Testing Library) |

Cobertura mínima: 80% linhas/branches no backend; 70% no frontend.

## Testes de Integração

| Escopo | Teste |
|---|---|
| Backend + PostgreSQL | `GET /v1/health` com banco UP retorna `200` |
| Backend + PostgreSQL | `GET /v1/health` com banco DOWN retorna `503` |
| Prisma migrate | Migration executa sem erros no container de teste |

## Testes E2E

| Escopo | Teste |
|---|---|
| Página `/` | Carrega com status 200 e título correto (Playwright) |
| Endpoint `/v1/health` | Acessível via HTTP com resposta correta |

## Critério de Conclusão

- [ ] `npm run lint` sem erros
- [ ] `npm run test --workspace=backend` verde
- [ ] `npm run test --workspace=frontend` verde
- [ ] `npm run test:e2e` verde
- [ ] Cobertura ≥ 80% backend / ≥ 70% frontend
