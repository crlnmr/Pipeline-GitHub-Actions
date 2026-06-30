# CH-11 — CI/CD Pipeline (GitHub Actions)

## Descrição

Configuração do pipeline de CI/CD no GitHub Actions com etapas obrigatórias: lint, testes unitários, testes de integração, testes E2E e verificação de cobertura. Inclui infraestrutura Docker para o banco de teste e publicação de relatórios de cobertura.

## RFs e RNFs Afetados

- **RNF-06** Testabilidade (pipeline automatizado de qualidade)
- **RNF-04** Escalabilidade (base para entrega contínua futura)

## Non-goals

- Deploy automático em produção (fora do escopo MVP).
- Infraestrutura Terraform de produção.
- Configuração de Grafana Cloud no CI.

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| `.github/workflows/ci.yml` | Pipeline de CI com jobs: `lint`, `test-backend`, `test-frontend`, `test-e2e` |
| Job `lint` | `npm run lint` em todos os workspaces — bloqueia PR se falhar |
| Job `test-backend` | `npm run test:cov --workspace=backend` com PostgreSQL 15 como service container |
| Job `test-frontend` | `npm run test:cov --workspace=frontend` |
| Job `test-e2e` | `npm run test:e2e` com backend e frontend em modo de teste (Docker Compose) |
| Coverage gate | Pipeline falha se cobertura < 80% backend / < 70% frontend |
| Relatório | Upload de cobertura como artefato do workflow |
| Branch protection | `main` e `develop` protegidas — PR requer CI verde |

## Dependências

- **CH-01** a **CH-10** — o pipeline apenas executa o que já está implementado; pode ser configurado progressivamente desde a CH-01.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Testes de integração flaky com PostgreSQL no CI | Média | Usar `health-check` no service container do GitHub Actions antes de rodar testes |
| Playwright sem display no CI | Baixa | Usar `xvfb-run` ou imagem `mcr.microsoft.com/playwright` oficial |
| Secrets do Clerk não disponíveis no CI | Média | Usar mocks de Clerk para testes; variáveis reais apenas para E2E de staging |
| Tempo de pipeline > 15min | Baixa | Cache de `node_modules` e parallelização de jobs |

## Execução de Linter

O pipeline executa o linter em todos os jobs. Não há lint adicional específico para esta mudança, mas o `ci.yml` deve seguir convenções YAML válidas.

## Testes Unitários

- Não há testes unitários para o arquivo YAML em si.
- Validação: pipeline deve ser testado em pull request de smoke (branch de teste).

## Testes de Integração

| Escopo | Teste |
|---|---|
| Job `test-backend` no CI | Executa com banco PostgreSQL de serviço e todos os testes passam |
| Job `test-frontend` no CI | Executa sem dependência de banco e todos os testes passam |
| Coverage gate backend | Falha se cobertura < 80% |
| Coverage gate frontend | Falha se cobertura < 70% |

## Testes E2E

| Escopo | Teste |
|---|---|
| Job `test-e2e` no CI | Playwright executa testes de fluxo críticos (vitrine, login, pedido, admin) contra ambiente de teste headless |

## Critério de Conclusão

- [ ] Pipeline executa todos os jobs sem erros em PR de smoke
- [ ] `lint` bloqueia merge se ESLint falhar
- [ ] `test-backend` e `test-frontend` com coverage gate funcionando
- [ ] `test-e2e` com Playwright headless passando
- [ ] Branch protection configurada para `main`
