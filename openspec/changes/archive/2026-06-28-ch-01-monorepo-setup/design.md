## Context

### Produto: e-micro-commerce
Plataforma de fluxo duplo para microempreendedores. Resolve o problema de
controle de pedidos e pagamentos que gera prejuízos diários.

### Perfis de Usuário
- **ADMIN**: empreendedor que gerencia categorias, produtos, clientes, pedidos
  e registra pagamentos manualmente. Visualiza dashboard financeiro.
- **CUSTOMER**: cliente que realiza pedidos e acompanha seus próprios
  pedidos, e pode cancelar pedidos não pagos.
- **Público**: qualquer visitante pode consultar o catálogo sem autenticação.

### Domínio e Entidades
- **Categoria**: agrupa produtos (atributos: nome, ativo).
- **Produto**: item comercializado (atributos: nome, categoria, imagem,
  descrição, preço, estoque, ativo). Produtos inativos não aparecem na vitrine.
- **Cliente**: pessoa que realiza pedidos (atributos: nome, endereço, e-mail,
  telefone, ativo). Clientes com pedidos só podem ser desativados, não removidos.
- **Pedido**: compra realizada (atributos: número, cliente, endereço de entrega,
  status, valor total calculado via soma de itens — não persistido).
- **ItemPedido**: linha do pedido (produto, preço unitário no momento da compra,
  quantidade).
- **Pagamento**: registro financeiro de um pedido (valor, método, data, status,
  observação). Um pagamento pertence a exatamente um pedido.

### Fluxo de Estados do Pedido
Novo → Pago → Preparação → Faturado → Despachado → Entregue
Qualquer estado (exceto Entregue) → Cancelado
- Pedido cancelado não pode retornar ao fluxo.
- Apenas ADMIN registra pagamentos.
- Toda mudança de status deve ser auditada.

### Stack Tecnológica
**Monorepo npm Workspaces**
```
apps/
 ├── frontend/  # Next.js 16+ · App Router · TypeScript · Vanilla CSS · Pino
 └── backend/   # NestJS 11+ · TypeScript · Prisma 7+ · PostgreSQL 15+
                # nestjs-pino · OpenTelemetry
infra/          # Terraform
docs/
.env            # único arquivo de ambiente na raiz
```

**Autenticação (padrão BFF obrigatório)**
- Provedor: Clerk.
- Fluxo: Frontend (formulários próprios) → Backend NestJS → Clerk API.
- Roles armazenadas no Clerk; Guards/Decorators do NestJS protegem recursos.
- Proibido no frontend: SDKs oficiais do Clerk, componentes SignIn/SignUp/\n  UserProfile/UserButton ou equivalentes.

**Backend**
- Estrutura de módulos: core/ (auth, database, observability, audit) +
  modules/ (catalog, orders, customers).
- Toda regra de negócio reside exclusivamente no backend NestJS.
- APIs RESTful versionadas: base URL https://api.dominio.com/v1
- Paginação obrigatória em coleções; filtros e ordenação quando aplicáveis.
- Erros seguem RFC 9457 Problem Details:
  { type, title, status, detail, instance }
- DTOs com class-validator; SOLID + Clean Architecture.
- Prisma como única forma de acesso ao banco (raw queries proibidas).
- Transações Prisma para operações atômicas.
- Rate limiting: 100 req/min por IP, 1000 req/min por usuário autenticado.
- APIs decoradas com Swagger/OpenAPI.

**Frontend**
- Páginas não contêm regras de negócio.
- Integração com APIs exclusivamente via camada services/.
- Server Actions usadas apenas como camada de transporte (sem regras de
  negócio, sem acesso a banco, sem acesso ao Prisma).
- Componentes desacoplados da infraestrutura.

**Design System: Nike-design-analysis**
Estilo editorial minimalista. Paleta quase monocromática:
- Primary / ink: #111111 · Canvas: #ffffff · Soft-cloud: #f5f5f5
- Sale: #d30005 · Success: #007d48 · Info: #1151ff
- Tipografia: Nike Futura ND 96px (display) → Helvetica Now Display Medium
  (headings 16–32px) → Helvetica Now Text (body/links). Substitutos open-source:
  Bebas Neue (display) + Inter 400/500 (UI).
- Bordas: botões sempre pill (border-radius: 9999px); cards sempre flat (0px).
- Elevação: zero drop-shadow; apenas 1px hairline (#cacacb) como divisor.
- Espaçamento base 8px; seções com 48px de ritmo vertical.
- Todo novo componente deve seguir os tokens definidos no design.md.

**Observabilidade**
- Logging estruturado em JSON via Pino (backend e frontend).
- Proibido console.log em produção.
- Todo log deve conter: timestamp, level, correlationId, event, message.
- Eventos de domínio a registrar: user.registered, cart.updated,
  order.created, order.cancelled, payment.approved, payment.failed.
- Toda requisição HTTP gera traces OpenTelemetry com trace_id, span_id, request_id.
- Plataforma de observabilidade: Grafana Cloud.
- Auditoria obrigatória em: alteração de preços, estoque, cancelamento de
  pedidos, reembolsos, alteração de permissões.
- Formato de auditoria: { usuario, objeto, acao, payload, timestamp }.

**Testes e Qualidade**
| Categoria  | Ferramenta           |
|------------|----------------------|
| Lint       | ESLint               |
| Unitário   | Jest                 |
| Integração | Jest + Supertest     |
| E2E        | Playwright           |

Cobertura mínima: Backend 80% linhas / 80% branches.
                  Frontend 70% linhas / 70% branches.
Critério de done: lint limpo + todos os testes passando + cobertura atingida.

**Infraestrutura**
- Containers compatíveis com OCI.
- Infra declarada via Terraform.
- CI/CD via GitHub Actions.
- PostgreSQL local via Docker Compose; produção via serviço gerenciado
  (Supabase, AWS RDS — sem extensões específicas de fornecedor).

**Restrições de Escopo (MVP)**
- Sem multi-tenancy, sem tenant_id, sem abstração de tenancy.
- Sem gateway de pagamento (registro manual pelo ADMIN).
- Sem e-mail transacional, WhatsApp, relatórios PDF/Excel.

## Goals / Non-Goals

**Goals:**
*   Establish the technical design for the "ch-01-monorepo-setup" change, focusing on setting up the monorepo structure and initial configurations for backend and frontend.
*   Define the core configurations for Next.js and NestJS projects within the monorepo.
*   Outline initial setup for essential tools like Prisma, ESLint, and potentially a basic CI pipeline setup.
*   Ensure adherence to the defined technology stack and design system constraints.

**Non-Goals:**
*   Implementation of specific business logic or features.
*   Detailed UI component design beyond establishing the design system's foundational aspects.
*   Full CI/CD pipeline implementation, focusing only on initial setup considerations.
*   Database schema definition beyond what's necessary for initial setup.

## Decisions

<!-- Key design decisions and rationale -->

*   **Monorepo Tooling:** Utilize `npm workspaces` for managing the monorepo, as specified in the tech stack. This provides a robust way to handle shared dependencies and package management within the project.
*   **Backend Framework Setup:** Use `NestJS CLI` for scaffolding the backend application. Configure it with TypeScript, Prisma, and `nestjs-pino` for logging, as per the stack.
*   **Frontend Framework Setup:** Use `create-next-app` with TypeScript and the App Router to scaffold the frontend application. Configure it with ESLint and Pino.
*   **Database Setup:** Use Prisma for ORM. The initial setup will involve defining the `schema.prisma` file and running `prisma migrate dev`. PostgreSQL will be the database.
*   **Authentication Setup (Initial):** Configure Clerk integration by setting up environment variables and necessary backend middleware/guards. The detailed integration will be handled in later steps/artifacts.
*   **Linting and Formatting:** Configure ESLint for both frontend and backend projects to enforce code quality and style. Use Prettier for consistent formatting.
*   **Design System Integration:** Incorporate the Nike-design-analysis design system tokens by creating a shared CSS/SCSS module or a theming solution that can be accessed by both frontend and potentially backend (for shared types). This will involve defining CSS variables or a theme object.
*   **Observability Setup:** Configure Pino for structured logging in both backend and frontend. Set up basic OpenTelemetry tracing in the backend.

## Risks / Trade-offs

<!-- Known risks and trade-offs -->

*   **Monorepo Complexity:** Managing dependencies and builds in a monorepo can become complex.
    *   Mitigation: Leverage `npm workspaces` effectively, potentially explore tools like Nx or Turborepo if complexity scales beyond npm workspaces' capabilities (though sticking to npm workspaces first is preferred per stack).
*   **Initial Setup Time:** Setting up a new monorepo with multiple frameworks and tools can be time-consuming.
    *   Mitigation: Focus on essential configurations first, deferring non-critical setups to later tasks. Automate as much as possible using CLI tools.
*   **Design System Adoption:** Ensuring consistent adherence to the design system across all components can be challenging.
    *   Mitigation: Establish clear design tokens and theme providers early on. Implement linting rules that enforce design system usage.

## Migration Plan:

<!-- Steps to deploy, rollback strategy (if applicable) -->

This change is focused on initial setup. Deployment will involve:
1.  Configuring CI/CD to build and deploy the monorepo.
2.  Setting up the PostgreSQL database (e.g., via Docker Compose for local dev, managed service for prod).
3.  Deploying the backend and frontend applications.
4.  Configuring Clerk credentials and environment variables for the deployed environment.

## Open Questions:

<!-- Outstanding decisions or unknowns to resolve -->

*   Exact setup for shared design tokens between frontend and backend (e.g., CSS variables in a global CSS file, shared TS types for theme colors).
*   Specific GitHub Actions workflow for initial monorepo build and test.
*   Confirmation on whether to include Prettier configuration at this stage.
