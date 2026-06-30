# Roadmap — e-micro-commerce MVP

> Planejamento incremental das mudanças para implementação full stack da plataforma DevAI.
> Cada mudança tem tamanho, complexidade e risco máximo **médio**.
> Nenhuma mudança é considerada concluída sem lint limpo + testes passando + cobertura mínima atingida.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                    e-micro-commerce MVP                              │
│                                                                     │
│  Perfis: ADMIN (empreendedor) · CUSTOMER (cliente) · Público        │
│                                                                     │
│  ┌─────────────┐   ┌─────────────────────────────────────────────┐  │
│  │   VITRINE   │   │             PAINEL ADMIN                    │  │
│  │  (público)  │   │  Catálogo · Clientes · Pedidos · Dashboard  │  │
│  └─────────────┘   └─────────────────────────────────────────────┘  │
│         │                        │                                  │
│         ▼                        ▼                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           Backend NestJS 11+ (BFF + API REST /v1)           │   │
│  │  core/auth · core/observability · core/audit                 │   │
│  │  modules/catalog · modules/orders · modules/customers        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            PostgreSQL 15 (Prisma 7+)                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Mudanças

| ID | Nome | Tamanho | Complexidade | Risco | RFs/RNFs |
|---|---|---|---|---|---|
| CH-01 | Monorepo Setup & Infraestrutura Base | Médio | Baixa | Baixo | RNF-04, 05, 06 |
| CH-02 | Autenticação via Clerk (BFF) | Médio | Média | Médio | RNF-01 |
| CH-03 | Observabilidade & Logging Estruturado | Pequeno | Baixa | Baixo | RNF-02, 03 |
| CH-04 | Catálogo: Backend (Categorias e Produtos) | Médio | Média | Baixo | RF-01, 03, 04 |
| CH-05 | Vitrine de Produtos (Frontend) | Médio | Média | Médio | RF-01, 02 (parcial) |
| CH-06 | Clientes: Backend | Pequeno | Baixa | Baixo | RF-05 |
| CH-07 | Pedidos & Pagamentos: Backend | Médio | Média | Médio | RF-02, 06 |
| CH-08 | Pedidos: Frontend Cliente | Médio | Baixa | Baixo | RF-02 |
| CH-09 | Admin: Catálogo, Clientes e Pedidos (Frontend) | Médio | Média | Médio | RF-03, 04, 05, 06 |
| CH-10 | Dashboard Administrativo | Pequeno | Baixa | Baixo | RF-07 |
| CH-11 | CI/CD Pipeline (GitHub Actions) | Pequeno | Baixa | Médio | RNF-06 |

---

## Sequência e Dependências

```
CH-01 (Monorepo Base)
  │
  ├──► CH-02 (Auth Clerk BFF)
  │       │
  │       ├──► CH-03 (Observabilidade)  ──────────────────────────────┐
  │       │                                                            │
  │       ├──► CH-04 (Catálogo Backend) ──► CH-05 (Vitrine Frontend)  │
  │       │       │                              │                    │
  │       │       └──► CH-06 (Clientes Backend)  │                    │
  │       │                   │                  │                    │
  │       │                   └──► CH-07 (Pedidos Backend)            │
  │       │                               │                           │
  │       │                               ├──► CH-08 (Pedidos Frontend│ Cliente)
  │       │                               │                           │
  │       │                               └──► CH-09 (Admin Frontend) │
  │       │                                         │                 │
  │       │                                         └──► CH-10 (Dashboard)
  │       │                                                            │
  └───────┴────────────────────────────────────────────────────────────┘
                                                                       │
  CH-11 (CI/CD) pode ser configurado desde CH-01 e evolui com cada ───┘
  mudança subsequente
```

### Dependências diretas

| Mudança | Depende de |
|---|---|
| CH-01 | — |
| CH-02 | CH-01 |
| CH-03 | CH-01 (recomenda CH-02) |
| CH-04 | CH-01, CH-02, CH-03 |
| CH-05 | CH-01, CH-02, CH-04, CH-07 |
| CH-06 | CH-01, CH-02, CH-03 |
| CH-07 | CH-01, CH-02, CH-03, CH-04, CH-06 |
| CH-08 | CH-02, CH-05, CH-07 |
| CH-09 | CH-02, CH-04, CH-06, CH-07 |
| CH-10 | CH-02, CH-07, CH-09 |
| CH-11 | CH-01 a CH-10 (evolutivo) |

---

## Protótipos de Interface (Stitch — Projeto devai)

| Tela | Mudança | ID Screen |
|---|---|---|
| SeWAI Vitrine Principal | CH-05 | `06b92f675d79447d8bb77b1159b8076c` |
| SeWAI Login | CH-02, CH-05 | `e32831dc170f4fd28d42f8e077a5ba66` |
| SeWAI Carrinho de Compras | CH-05 | `9a6d0c3cb33d474aba16d4134260ef48` |
| SeWAI Meus Pedidos | CH-08 | `1ab61ac4f0594e67b354d5f663db44e0` |
| SeWAI Detalhe do Pedido | CH-08, CH-09 | `e868ef88e67d4c0fba19128e11ca4661` |
| SeWAI Gestão de Categorias | CH-09 | `390f69948ede4c82817f7911dbaa0033` |
| SeWAI Gestão de Produtos | CH-09 | `87323a91f45d4a4c9db64a2fec571a14` |
| SeWAI Gestão de Clientes | CH-09 | `49f38e44d0a245a78d02d74b261fd34a` |
| SeWAI Gestão de Pedidos | CH-09 | `8a6629f8ddee49c58fe7fa176d9bbbee` |
| SeWAI Dashboard Admin | CH-10 | `ca99db1e64f841a4bacb6714de77efd9` |

Projeto Stitch: `projects/8659991370116105465` (devai)

---

## Cobertura de Requisitos

### Requisitos Funcionais

| RF | Mudanças que o implementam |
|---|---|
| RF-01 Vitrine de Produtos | CH-04 (API) + CH-05 (UI) |
| RF-02 Criação e Acompanhamento de Pedidos | CH-07 (API) + CH-05 (criação) + CH-08 (acompanhamento) |
| RF-03 Gestão de Categorias | CH-04 (API) + CH-09 (UI admin) |
| RF-04 Gestão de Produtos | CH-04 (API) + CH-09 (UI admin) |
| RF-05 Gestão de Clientes | CH-06 (API) + CH-09 (UI admin) |
| RF-06 Gestão de Pedidos | CH-07 (API) + CH-09 (UI admin) |
| RF-07 Dashboard | CH-10 (API + UI) |

### Requisitos Não Funcionais

| RNF | Mudanças que o implementam |
|---|---|
| RNF-01 Segurança | CH-02 (auth BFF) + CH-04/06/07 (RBAC) + CH-05/08/09 (proteção de rotas) |
| RNF-02 Auditoria | CH-03 (AuditService) + CH-04/06/07 (@Audit()) |
| RNF-03 Observabilidade | CH-03 (Pino + OpenTelemetry + CorrelationId) |
| RNF-04 Escalabilidade | CH-01 (containers OCI) + CH-11 (CI/CD) |
| RNF-05 Portabilidade | CH-01 (Docker Compose + Prisma sem raw queries) |
| RNF-06 Testabilidade | CH-01 (toolchain) + CH-11 (pipeline automatizado) |

---

## Critério Global de Done (por mudança)

Toda mudança deve, ao ser concluída:

1. ✅ `npm run lint` sem erros (ESLint)
2. ✅ `npm run test --workspace=backend` verde (quando aplicável)
3. ✅ `npm run test --workspace=frontend` verde (quando aplicável)
4. ✅ Cobertura ≥ **80% linhas/branches** no backend
5. ✅ Cobertura ≥ **70% linhas/branches** no frontend
6. ✅ Testes E2E aplicáveis passando (Playwright)
7. ✅ Migration Prisma versionada (quando há alteração de schema)
8. ✅ Swagger atualizado (quando há novos endpoints)

---

## Design System

Todas as interfaces seguem os tokens do **Nike-design-analysis** definidos em `docs/design.md`:

- **Cores**: `ink` (#111111) · `canvas` (#fff) · `soft-cloud` (#f5f5f5) · `sale` (#d30005) · `success` (#007d48)
- **Tipografia**: Bebas Neue (display) + Inter 400/500 (UI) — substitutos open-source
- **Botões**: sempre pill (`border-radius: 9999px`)
- **Cards**: sempre flat (`border-radius: 0`)
- **Elevação**: sem drop-shadow; apenas 1px hairline (#cacacb) como divisor

---

## Proposta de Sequência de Sprints (MVP em 4 semanas)

| Sprint | Mudanças | Entrega |
|---|---|---|
| **Sprint 1** (dias 1-7) | CH-01 + CH-02 + CH-03 + CH-11 (base CI) | Esqueleto funcional com auth e observabilidade |
| **Sprint 2** (dias 8-14) | CH-04 + CH-06 | Backend de catálogo e clientes completo e testado |
| **Sprint 3** (dias 15-21) | CH-07 + CH-05 | Backend de pedidos + vitrine pública com carrinho |
| **Sprint 4** (dias 22-30) | CH-08 + CH-09 + CH-10 | Frontend admin completo + dashboard + E2E final |
