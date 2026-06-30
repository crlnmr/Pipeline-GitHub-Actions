# CH-06 — Clientes: Backend (RF-05)

## Descrição

Implementação do módulo `customers` no backend NestJS com CRUD completo de Clientes. Inclui migration Prisma, regras de negócio de desativação (clientes com pedidos não podem ser removidos, apenas desativados) e sincronização com usuário autenticado.

## RFs e RNFs Afetados

- **RF-05** Gestão de Clientes
- **RNF-01** Segurança (apenas ADMIN gerencia clientes via admin; CUSTOMER acessa seus próprios dados)
- **RNF-02** Auditoria (alterações em dados de clientes)

## Non-goals

- Frontend de gestão de clientes (CH-09).
- CRM avançado (versões futuras).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Migration | Tabela `Customer` (nome, endereço, e-mail, telefone, ativo, userId) |
| ADMIN endpoints | `GET /v1/customers` (paginado, filtrável), `GET /v1/customers/:id`, `POST /v1/customers`, `PATCH /v1/customers/:id`, `DELETE /v1/customers/:id` |
| Regras | Clientes com pedidos só podem ser desativados (`ativo = false`), não removidos; retorna 409 se tentativa de DELETE com pedidos |
| DTOs | `CreateCustomerDto`, `UpdateCustomerDto` com `class-validator` |
| Auditoria | `@Audit()` em criação, atualização e desativação de clientes |
| Swagger | Endpoints documentados |

## Dependências

- **CH-01** (monorepo base)
- **CH-02** (JwtAuthGuard, RBAC)
- **CH-03** (AuditService)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Cliente associado a pedido removido por engano | Baixa | Service verifica `_count.orders > 0` antes de deletar via Prisma |
| E-mail duplicado | Baixa | Constraint `unique` na migration + tratamento no service com `ConflictException` |

## Execução de Linter

```bash
npm run lint --workspace=backend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `CustomersService.create()` | Cria cliente com dados válidos |
| `CustomersService.create()` | Lança `ConflictException` para e-mail duplicado |
| `CustomersService.remove()` | Remove cliente sem pedidos |
| `CustomersService.remove()` | Lança `ConflictException` se cliente tem pedidos |
| `CustomersService.update()` | Atualiza dados e dispara auditoria |
| `CustomersService.findAll()` | Retorna lista paginada |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `POST /v1/customers` | Cria cliente com token ADMIN (201) |
| `POST /v1/customers` | Retorna 403 com token CUSTOMER |
| `DELETE /v1/customers/:id` | Retorna 409 se cliente tem pedidos |
| `PATCH /v1/customers/:id` | Atualiza parcialmente e retorna 200 |
| `GET /v1/customers` | Retorna lista paginada (ADMIN) |

## Testes E2E

- Não aplicável nesta mudança. E2E de gestão de clientes será validado na CH-09 (frontend admin).

## Critério de Conclusão

- [ ] `npm run lint --workspace=backend` sem erros
- [ ] `npm run test --workspace=backend` verde
- [ ] Cobertura backend ≥ 80%
- [ ] Migration Prisma aplicada sem erros
