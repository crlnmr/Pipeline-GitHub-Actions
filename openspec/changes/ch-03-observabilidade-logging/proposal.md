# CH-03 — Observabilidade & Logging Estruturado

## Descrição

Configuração de logging estruturado em JSON via Pino (backend e frontend), Correlation ID por requisição, traces OpenTelemetry em todos os endpoints HTTP e infraestrutura de auditoria para operações críticas.

## RFs e RNFs Afetados

- **RNF-02** Auditoria
- **RNF-03** Observabilidade

## Non-goals

- Configuração de Grafana Cloud (ambiente de produção — fora do MVP local).
- Alertas e dashboards Grafana.
- Tracing distribuído multi-serviço (aplicação é single-backend no MVP).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Backend `core/observability/` | `nestjs-pino` configurado com formato JSON; campos obrigatórios: `timestamp`, `level`, `correlationId`, `event`, `message` |
| Backend | Middleware `CorrelationIdMiddleware` — gera UUID e propaga via header `X-Correlation-ID` |
| Backend | Interceptor `LoggingInterceptor` — loga entrada/saída de cada request |
| Backend `core/audit/` | `AuditService` com método `log(usuario, objeto, acao, payload)` |
| Backend | Decorator `@Audit()` para endpoints críticos (pedidos, pagamentos, preços, permissões) |
| Backend | Instrumentação OpenTelemetry básica (trace por endpoint HTTP) |
| Frontend | Pino configurado para logging estruturado em Server Components |
| Geral | Proibição de `console.log` — regra ESLint `no-console` ativada |

## Dependências

- **CH-01** concluída.
- **CH-02** recomendada (para ter `correlationId` associado ao usuário autenticado nos logs).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Volume de logs em dev muito alto | Baixa | Configurar `LOG_LEVEL=warn` no `.env` de dev |
| OpenTelemetry com overhead de performance | Baixa | Configurar sampling rate baixo em dev |
| `AuditService` sem persistência inicial | Média | MVP: audit em log JSON; persistência em banco é evolução futura |

## Execução de Linter

```bash
npm run lint --workspace=backend   # Verifica no-console e import de logger correto
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `CorrelationIdMiddleware` | Gera UUID quando header ausente |
| `CorrelationIdMiddleware` | Propaga header existente sem alterar |
| `LoggingInterceptor` | Loga método, path e status de cada request |
| `AuditService.log()` | Emite log com campos `usuario`, `objeto`, `acao`, `payload`, `timestamp` |
| `AuditService.log()` | Não loga campos sensíveis (senha, token) |

## Testes de Integração

| Escopo | Teste |
|---|---|
| Qualquer endpoint | Response inclui header `X-Correlation-ID` |
| `GET /v1/health` | Log estruturado gerado com todos os campos obrigatórios |
| Endpoint com `@Audit()` | Gera entrada de auditoria ao ser chamado |

## Testes E2E

| Escopo | Teste |
|---|---|
| Fluxo de request | Header `X-Correlation-ID` presente na resposta (Playwright `extraHTTPHeaders`) |

## Critério de Conclusão

- [ ] `npm run lint` sem erros (incluindo `no-console`)
- [ ] Todos os testes unitários e de integração verdes
- [ ] Cobertura ≥ 80% backend / ≥ 70% frontend
- [ ] Nenhum `console.log` detectado no código de produção
