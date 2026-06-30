# CH-07 — Pedidos & Pagamentos: Backend (RF-02 + RF-06)

## Descrição

Implementação do módulo `orders` no backend NestJS com criação de pedidos pelo CUSTOMER, máquina de estados de pedidos, registro manual de pagamento pelo ADMIN e validações de estoque. Inclui migrations Prisma para `Order`, `OrderItem` e `Payment`.

## Protótipo de Referência (Stitch devai)

- **SeWAI Gestão de Pedidos** — filtro por status, atualizar status, detalhar pedido
- **SeWAI Detalhe do Pedido** — número, status, produtos, alterar status
- **SeWAI Meus Pedidos** — histórico do customer, filtros

## RFs e RNFs Afetados

- **RF-02** Criação e Acompanhamento de Pedidos
- **RF-06** Gestão de Pedidos (admin)
- **RNF-01** Segurança (IDOR: customer só acessa seus próprios pedidos)
- **RNF-02** Auditoria (mudança de status, cancelamento, pagamento)

## Non-goals

- Gateway de pagamento real (MVP: registro manual).
- Frontend de pedidos (CH-08 e CH-09).
- E-mail de confirmação.

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Migrations | Tabelas `Order`, `OrderItem`, `Payment` com Prisma 7+ |
| CUSTOMER endpoints | `POST /v1/orders` (criar), `GET /v1/orders/my` (meus pedidos), `PATCH /v1/orders/:id/cancel` (cancelar não pago) |
| ADMIN endpoints | `GET /v1/orders` (todos, filtrável por status), `GET /v1/orders/:id`, `PATCH /v1/orders/:id/status`, `POST /v1/orders/:id/payments` |
| Máquina de estados | Novo→Pago→Preparação→Faturado→Despachado→Entregue; Qualquer (exceto Entregue)→Cancelado |
| Validação de estoque | Na confirmação: valida estoque disponível; deduz estoque após pagamento |
| Cálculo do total | Soma dos itens (preço unitário × quantidade); não persistido no Order |
| IDOR protection | Customer só vê/cancela seus próprios pedidos |
| Auditoria | `@Audit()` em mudança de status, cancelamento e registro de pagamento |
| DTOs | `CreateOrderDto`, `UpdateOrderStatusDto`, `CreatePaymentDto` com `class-validator` |
| Swagger | Endpoints documentados |

## Dependências

- **CH-01** (monorepo base)
- **CH-02** (JwtAuthGuard, RBAC, `@CurrentUser()`)
- **CH-03** (AuditService)
- **CH-04** (Produto/Categoria — validação de produto ativo e estoque)
- **CH-06** (Customer — associar pedido ao cliente)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Race condition no estoque (dois pedidos simultâneos) | Baixa | Transação Prisma com `select for update` (ou re-validação otimista no MVP) |
| Transição de estado inválida | Baixa | Mapa de transições validado no `OrdersService` com enum de estados |
| Pedido cancelado retornando ao fluxo | Baixa | Guard no service: estado `CANCELLED` é terminal |

## Execução de Linter

```bash
npm run lint --workspace=backend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `OrdersService.create()` | Cria pedido com itens válidos |
| `OrdersService.create()` | Lança `BadRequestException` com pedido sem itens |
| `OrdersService.create()` | Lança `BadRequestException` se produto inativo |
| `OrdersService.create()` | Lança `BadRequestException` se quantidade > estoque |
| `OrdersService.transitionStatus()` | Transição válida (ex.: Novo→Pago) permitida |
| `OrdersService.transitionStatus()` | Transição inválida lança `UnprocessableEntityException` |
| `OrdersService.cancel()` | Cancela pedido no estado Novo |
| `OrdersService.cancel()` | Lança exceção para pedido Entregue |
| `OrdersService.registerPayment()` | Cria pagamento e transiciona pedido para Pago |
| `PaymentService` | Retorna 403 se CUSTOMER tenta registrar pagamento |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `POST /v1/orders` | Cria pedido (CUSTOMER autenticado) → 201 |
| `POST /v1/orders` | Retorna 401 sem autenticação |
| `GET /v1/orders/my` | CUSTOMER vê apenas seus pedidos |
| `GET /v1/orders` | ADMIN vê todos os pedidos paginados |
| `PATCH /v1/orders/:id/status` | ADMIN transiciona status corretamente |
| `POST /v1/orders/:id/payments` | ADMIN registra pagamento → pedido fica Pago |
| `PATCH /v1/orders/:id/cancel` | CUSTOMER cancela pedido Novo |
| IDOR | CUSTOMER tenta acessar pedido de outro → 403 |

## Testes E2E

- Não aplicável nesta mudança. E2E de pedidos será validado na CH-08 (frontend cliente) e CH-09 (frontend admin).

## Critério de Conclusão

- [ ] `npm run lint --workspace=backend` sem erros
- [ ] `npm run test --workspace=backend` verde (incluindo novos testes)
- [ ] Cobertura backend ≥ 80%
- [ ] Migrations `Order`, `OrderItem`, `Payment` aplicadas sem erros
