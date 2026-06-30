## Context

O projeto e-micro-commerce está em fase de MVP com scaffold básico concluído (CH-01). A autenticação é um pré-requisito para qualquer operação protegida do sistema — catálogo, pedidos, clientes e pagamentos.

Decidiu-se pelo Clerk como provedor de identidade, seguindo o padrão BFF (Backend-for-Frontend): o frontend Next.js envia credenciais para o backend NestJS, que consome a Clerk API. O Clerk SDK é proibido no frontend por decisão arquitetural.

Atualmente não existe qualquer infraestrutura de autenticação — nem modelos de usuário no banco, nem guards, nem formulário de login.

## Goals / Non-Goals

**Goals:**
- Implementar sign-in e sign-up via Clerk API no backend NestJS (módulo `core/auth`)
- Criar Guards (`JwtAuthGuard`) e Decorators (`@CurrentUser()`, `@Roles()`) para proteger recursos
- Sincronizar usuários do Clerk para a tabela local `User` via webhook `user.created`
- Criar página de login `/login` no frontend com formulário próprio (e-mail + senha)
- Criar camada `services/auth.service.ts` no frontend para comunicação com backend
- Implementar middleware Next.js para proteção de rotas
- Cobertura de testes ≥ 80% backend / ≥ 70% frontend

**Non-Goals:**
- SDKs oficiais do Clerk no frontend (proibido)
- Componentes SignIn/SignUp/UserProfile/UserButton do Clerk
- Recuperação de senha (gerenciada pelo Clerk, fora do escopo MVP)
- MFA (Clerk gerencia)
- Logout (será abordado em change futura)

## Decisions

### 1. Clerk SDK no backend via `@clerk/clerk-sdk-node`

**Decisão:** Usar o SDK oficial do Clerk para Node.js (`@clerk/clerk-sdk-node`) no módulo NestJS `core/auth`.

**Rationale:** O SDK fornece client tipado e validated para a Clerk API (sign-in, sign-up, verificação de token JWT). Alternativa seria chamar a REST API do Clerk diretamente com `fetch`, o que exigiria implementar serialização, tratamento de erros e lógica de renew manual. O SDK abstrai isso.

**Alternativa considerada:** Clerk REST API via `fetch` — rejeitada pela falta de tipagem e maior superfície de manutenção.

### 2. Sincronização via Webhook (não via JWT embed)

**Decisão:** Usar webhook `user.created` do Clerk para criar/atualizar registro local na tabela `User`.

**Rationale:** O JWT do Clerk contém apenas `sub` (Clerk userId) e metadados públicos. Para associar pedidos, clientes e outras entidades de negócio a um usuário local, precisamos de um ID interno (UUID). O webhook permite manter a tabela `User` sincronizada sem polling.

**Alternativa considerada:** Extrair dados do JWT a cada requisição — rejeitada porque o JWT tem tamanho limitado e não comporta todos os dados necessários para relacionamentos.

### 3. Token JWT via cookie httpOnly (não localStorage)

**Decisão:** O backend retorna o token JWT em um cookie httpOnly, secure e sameSite strict.

**Rationale:** Cookies httpOnly não são acessíveis via JavaScript, mitigando ataques XSS. O frontend envia o cookie automaticamente em cada requisição, eliminando a necessidade de gerenciar tokens manualmente.

**Alternativa considerada:** Bearer token no header `Authorization` armazenado em `localStorage` — rejeitada por vulnerabilidade a XSS.

### 4. Guard JwtAuthGuard como guarda global

**Decisão:** Registrar `JwtAuthGuard` como guard global no NestJS, com rotas públicas explicitamente marcadas com `@Public()`.

**Rationale:** Segurança por default — qualquer nova rota é automaticamente protegida. O desenvolvedor precisa optar por tornar uma rota pública, reduzindo esquecimentos.

### 5. Roles como metadados no Clerk

**Decisão:** Armazenar roles (`ADMIN`, `CUSTOMER`) nos metadados públicos do usuário no Clerk e sincronizar para a tabela local.

**Rationale:** Clerk permite armazenar metadados públicos e privados. Metadados públicos são incluídos no JWT como custom claims, permitindo que o Guard `@Roles()` extraia a role sem consultar o banco a cada requisição.

## Risks / Trade-offs

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Clerk API mudar entre versões | Baixa | Fixar versão do `@clerk/clerk-sdk-node`; consultar Context7 MCP antes de codificar |
| Token JWT expirado sem refresh | Média | Implementar renovação automática via cookie httpOnly; Clerk SDK gerencia refresh internamente |
| Webhook não disponível em dev local | Média | Usar Clerk CLI (`clerk webhooks`) ou ngrok para tunelamento |
| Latência adicional na primeira chamada ao Clerk | Baixa | Cache de chave pública JWKS com TTL configurável |
| Sincronização webhook falhar (rede) | Baixa | Webhook Clerk tem retry automático; log de falha para auditoria |

## Migration Plan

1. Adicionar `@clerk/clerk-sdk-node` ao backend e configurar variáveis de ambiente no `.env`
2. Criar modelo `User` no Prisma e rodar migration
3. Implementar módulo `core/auth` com `AuthService`, `AuthController`
4. Implementar `JwtAuthGuard`, `@CurrentUser()`, `@Roles()`
5. Endpoints `POST /v1/auth/sign-in` e `POST /v1/auth/sign-up`
6. Endpoint webhook `POST /v1/auth/webhook` (protegido por chave secreta)
7. Criar `services/auth.service.ts` no frontend
8. Criar página `/login`
9. Middleware Next.js para proteção de rotas
10. Testes unitários, integração e E2E
11. Validar lint e cobertura

**Rollback:** Desabilitar o guard global e expor rotas públicas via `@Public()`; reverter cookie de autenticação.

## Open Questions

- Qual o TTL ideal para o cookie de sessão? Proposta inicial: 7 dias com renovação a cada requisição.
- Endpoint de refresh token será necessário ou o Clerk SDK gerencia automaticamente? Verificar documentação do SDK.
- O webhook `user.updated` será necessário para sincronizar alterações de perfil?
