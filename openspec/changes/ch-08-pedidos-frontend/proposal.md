# CH-08 — Pedidos: Frontend Cliente (RF-02)

## Descrição

Implementação das telas de acompanhamento de pedidos pelo cliente: histórico de pedidos, detalhe do pedido e cancelamento. Baseado nos protótipos "SeWAI Meus Pedidos" e "SeWAI Detalhe do Pedido" do Stitch devai.

## Protótipos de Referência (Stitch devai)

- **SeWAI Meus Pedidos** — listagem com filtros de status, botão detalhar
- **SeWAI Detalhe do Pedido** — número, status, produtos, botão alterar status (cancelar para customer)

## RFs e RNFs Afetados

- **RF-02** Criação e Acompanhamento de Pedidos (acompanhamento pelo cliente)

## Non-goals

- Admin de pedidos (CH-09).
- Registro de pagamento (exclusivo do ADMIN).
- Transição de status além de cancelamento (ADMIN).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| `app/(auth)/my-orders/page.tsx` | Lista dos pedidos do customer com filtro de status |
| `app/(auth)/my-orders/[id]/page.tsx` | Detalhe do pedido: itens, preços, status atual |
| `components/OrderStatusBadge` | Badge de status com cor semântica (success, sale, info do design system) |
| `components/OrderCard` | Card do pedido na listagem |
| `services/orders.service.ts` | `getMyOrders()`, `getOrderById()`, `cancelOrder()` |
| Cancelamento | Botão "Cancelar Pedido" visível apenas para status `NOVO` |

## Dependências

- **CH-02** (autenticação — rota protegida para customer logado)
- **CH-05** (navegação da vitrine para "Meus Pedidos")
- **CH-07** (API de pedidos disponível)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Customer tentar cancelar pedido em status inválido via UI | Baixa | Botão de cancelamento condicional por status no frontend + validação no backend |
| Listagem sem paginação — muitos pedidos | Baixa | Implementar paginação simples (limite 20 por página) |

## Execução de Linter

```bash
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `OrderStatusBadge` | Renderiza badge com cor correta por status |
| `OrderCard` | Renderiza número, status e valor total |
| `orders.service.getMyOrders()` | Chama endpoint correto com token |
| `orders.service.cancelOrder()` | Chama `PATCH /v1/orders/:id/cancel` |
| `MyOrdersPage` | Lista pedidos recebidos da API |
| `OrderDetailPage` | Exibe botão cancelar apenas para status NOVO |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `/my-orders` | Renderiza com dados da API `GET /v1/orders/my` |
| `/my-orders/:id` | Renderiza detalhe com dados de `GET /v1/orders/:id` |
| Cancelamento | `PATCH /v1/orders/:id/cancel` chamado ao clicar em cancelar |

## Testes E2E (Playwright)

| Escopo | Teste |
|---|---|
| Happy path acompanhamento | Usuário logado acessa "Meus Pedidos", clica em pedido, vê detalhes |
| Cancelamento | Usuário cancela pedido NOVO — status atualiza na tela |
| Acesso sem login | Redireciona para `/login` |

## Critério de Conclusão

- [ ] `npm run lint --workspace=frontend` sem erros
- [ ] `npm run test --workspace=frontend` verde
- [ ] Cobertura frontend ≥ 70%
- [ ] E2E de acompanhamento e cancelamento passando
