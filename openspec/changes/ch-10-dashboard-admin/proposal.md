# CH-10 — Dashboard Administrativo (RF-07)

## Descrição

Implementação do dashboard financeiro para o ADMIN: total de vendas, valores recebidos, valores pendentes e filtro por período. Inclui endpoint de agregação no backend e tela "SeWAI Dashboard Admin" do Stitch devai.

## Protótipo de Referência (Stitch devai)

- **SeWAI Dashboard Admin** — cards de métricas (Vendas Totais, Recebido, Pendente), filtro de período, gráfico simplificado

## RFs e RNFs Afetados

- **RF-07** Dashboard
- **RNF-01** Segurança (acesso exclusivo ADMIN)

## Non-goals

- Gráficos avançados de séries temporais (MVP: indicadores numéricos apenas).
- Exportação PDF/Excel (versões futuras).
- Relatórios por produto ou categoria.

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Backend `GET /v1/dashboard/summary` | Parâmetros: `startDate`, `endDate`; resposta: `{ totalSales, totalReceived, totalPending }` |
| Backend | Lógica de agregação: `totalSales` = soma de pedidos não cancelados; `totalReceived` = soma de pagamentos com status Confirmado; `totalPending` = totalSales − totalReceived |
| Frontend `app/(admin)/dashboard/page.tsx` | Cards de métricas com filtro de período (padrão: últimos 30 dias) |
| `components/MetricCard` | Card de métrica com valor formatado em R$ e label |
| `components/DateRangeFilter` | Seletor de período (data início / data fim) |
| `services/dashboard.service.ts` | `getSummary(startDate, endDate)` |

## Dependências

- **CH-02** (autenticação ADMIN)
- **CH-07** (dados de pedidos e pagamentos no banco)
- **CH-09** (layout admin — página de dashboard integrada à nav lateral)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Query de agregação lenta com muitos pedidos | Baixa | Índice em `Order.createdAt` e `Payment.date` na migration; MVP sem otimização avançada |
| Período inválido (startDate > endDate) | Baixa | Validação no DTO com `@IsDateString()` e validação cruzada |
| Valor Pendente negativo (pagamentos > total de vendas) | Baixa | Retornar `Math.max(0, totalPending)` na query |

## Execução de Linter

```bash
npm run lint --workspace=backend
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo Backend | Teste |
|---|---|
| `DashboardService.getSummary()` | Retorna zeros para período sem pedidos |
| `DashboardService.getSummary()` | Soma correta de pedidos não cancelados |
| `DashboardService.getSummary()` | Exclui pedidos cancelados de `totalSales` |
| `DashboardService.getSummary()` | `totalPending` = `totalSales` − `totalReceived` |
| `DashboardController` | Retorna 403 para CUSTOMER |

| Escopo Frontend | Teste |
|---|---|
| `MetricCard` | Formata valor corretamente em R$ |
| `DateRangeFilter` | Emite evento com datas ao aplicar filtro |
| `DashboardPage` | Renderiza 3 cards de métricas |
| `dashboard.service.getSummary()` | Chama endpoint correto com parâmetros de data |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `GET /v1/dashboard/summary` | Retorna 200 com estrutura correta (ADMIN) |
| `GET /v1/dashboard/summary` | Retorna 403 com token CUSTOMER |
| `GET /v1/dashboard/summary?startDate=&endDate=` | Usa padrão de 30 dias |
| `GET /v1/dashboard/summary` com dados | Valores calculados são corretos |

## Testes E2E (Playwright)

| Escopo | Teste |
|---|---|
| Dashboard padrão | Admin acessa dashboard, vê 3 cards com valores numéricos |
| Filtro de período | Admin aplica filtro e cards atualizam com novos valores |
| Acesso sem ADMIN | Redireciona para `/login` |

## Critério de Conclusão

- [ ] `npm run lint` sem erros (backend e frontend)
- [ ] `npm run test --workspace=backend` verde
- [ ] `npm run test --workspace=frontend` verde
- [ ] Cobertura ≥ 80% backend / ≥ 70% frontend
- [ ] E2E do dashboard passando
