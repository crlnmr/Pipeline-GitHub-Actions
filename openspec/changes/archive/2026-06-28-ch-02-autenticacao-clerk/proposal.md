# CH-02 — Autenticação via Clerk (BFF)

## Descrição

Implementação do fluxo de autenticação no padrão BFF: formulários próprios no frontend (tela de Login do Stitch — "SeWAI Login") enviando para o backend NestJS, que consome a API do Clerk. Inclui RBAC com roles ADMIN e CUSTOMER armazenadas no Clerk, Guards e Decorators do NestJS.

## Prototipo de Referência

- **SeWAI Login** — campos: e-mail, senha; comandos: Entrar, Criar conta.

## RFs e RNFs Afetados

- **RNF-01** Segurança (autenticação e autorização exclusivamente no backend)

## Non-goals

- SDKs oficiais do Clerk no frontend (proibido por arquitetura).
- Componentes SignIn/SignUp/UserProfile/UserButton do Clerk.
- Recuperação de senha (gerenciada pelo Clerk, fora do escopo MVP frontend).
- MFA (Clerk gerencia).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Backend `core/auth/` | Integração com Clerk API (sign-in, sign-up, validação de token JWT) |
| Backend | Guard `JwtAuthGuard`, Decorator `@CurrentUser()`, Decorator `@Roles()` |
| Backend | Endpoint `POST /v1/auth/sign-in` e `POST /v1/auth/sign-up` |
| Backend | Sincronização de usuário Clerk → local (evento webhook `user.created`) |
| Frontend | Página `/login` com formulário próprio (e-mail + senha) |
| Frontend | `services/auth.service.ts` para comunicação com backend |
| Frontend | Middleware Next.js para proteção de rotas autenticadas |

## Dependências

- **CH-01** concluída (monorepo e scaffold base).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| API do Clerk alterar contratos entre versões | Baixa | Consultar Context7 MCP antes de codificar; fixar versão do Clerk SDK no backend |
| Token JWT expirado sem refresh adequado | Média | Implementar renovação automática via cookie httpOnly no backend |
| Webhook Clerk não configurado em dev local | Média | Usar Clerk CLI `clerk webhooks` ou ngrok para tunelamento local |

## Execução de Linter

```bash
npm run lint --workspace=backend
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `JwtAuthGuard` | Permite request com token válido |
| `JwtAuthGuard` | Bloqueia request sem token (401) |
| `JwtAuthGuard` | Bloqueia request com token inválido (401) |
| `@Roles('ADMIN')` | Bloqueia CUSTOMER em rota ADMIN (403) |
| `AuthService.signIn()` | Retorna token em credenciais válidas |
| `AuthService.signIn()` | Lança `UnauthorizedException` em credenciais inválidas |
| Frontend `LoginPage` | Renderiza campos e-mail e senha |
| Frontend `LoginPage` | Exibe erro em submit com campos vazios |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `POST /v1/auth/sign-in` | Retorna 200 + token com credenciais válidas (Clerk mock) |
| `POST /v1/auth/sign-in` | Retorna 401 com credenciais inválidas |
| `POST /v1/auth/sign-up` | Cria usuário e retorna 201 |
| Rota protegida sem token | Retorna 401 Problem Details (RFC 9457) |
| Rota ADMIN com token CUSTOMER | Retorna 403 Problem Details (RFC 9457) |

## Testes E2E

| Escopo | Teste |
|---|---|
| Fluxo login completo | Usuário preenche e-mail/senha, submete e é redirecionado (Playwright) |
| Rota protegida sem login | Redireciona para `/login` |
| Login inválido | Exibe mensagem de erro na tela |

## Critério de Conclusão

- [ ] `npm run lint` sem erros
- [ ] Todos os testes unitários e de integração verdes
- [ ] Cobertura ≥ 80% backend / ≥ 70% frontend
- [ ] E2E de login e proteção de rota passando
