# AGENTS.md — Diretrizes Operacionais (DevAI)

Este arquivo define o comportamento, limites e procedimentos operacionais para agentes de IA neste repositório.

## 1. Comandos Principais (Commands-First)

Execute comandos a partir da raiz do monorepo:

| Operação | Comando Executável |
| :--- | :--- |
| **Setup Inicial** | `npm install && docker compose up -d db` |
| **Banco de Dados** | `npm run prisma:migrate:dev --workspace=backend` |
| **Build** | `npm run build` |
| **Execução (Dev)** | `npm run dev` |
| **Lint** | `npm run lint` |
| **Testes Backend** | `npm run test --workspace=backend` (ou `test:cov`) |
| **Testes Frontend** | `npm run test --workspace=frontend` (ou `test:e2e`) |

## 2. Governança e Autonomia (Boundaries)

### Always Do (Sempre faça de forma autônoma)
- **Leitura/Escrita de Arquivos:** Criar, ler, editar ou excluir arquivos de código dentro do escopo da tarefa (mudanças cirúrgicas).
- **Inspeção e Busca:** Usar ferramentas de busca (`grep`), listar diretórios e ler arquivos de log/configuração para entender o contexto.
- **Validação Local:** Rodar comandos de lint (`npm run lint`), formatação e testes locais antes de concluir tarefas.
- **Limpeza de Órfãos:** Excluir imports, variáveis e funções que se tornaram órfãs devido às suas alterações.

### Ask First (Pergunte antes de executar)
- **Modificações Globais:** Criar ou remover diretórios principais ou alterar arquivos de configuração global (ex: `.env`, `package.json`, `tsconfig.json`).
- **Banco de Dados:** Alterar o schema do banco de dados ou criar/executar novas migrations Prisma.
- **Dependências:** Adicionar ou atualizar pacotes npm.
- **Arquitetura:** Modificar decisões arquiteturais definidas, padrões de API ou estruturas de rotas.

### Never Do (Proibições Absolutas)
- **Bypass de BFF:** Acessar o banco de dados/Prisma direto do frontend.
- **SDKs Clerk no Frontend:** Usar componentes/SDKs oficiais do Clerk no Next.js (autenticação é exclusiva do backend NestJS).
- **Dados Sensíveis em Logs:** Registrar senhas, tokens ou dados pessoais (LGPD).
- **Bypass de Testes:** Remover testes existentes para fazer uma tarefa passar.
- **Tenancy no MVP:** Implementar multi-tenancy (restrito a evoluções futuras).

## 3. Regras de Qualidade, Testes e Logging

### Testes e Cobertura Mínima
- Toda alteração em lógica de negócio exige testes correspondentes (felizes, falhas e limites).
- **Cobertura Backend:** Mínimo de 80% de linhas e 80% de branches.
- **Cobertura Frontend:** Mínimo de 70% de linhas e 70% de branches.

### Tratamento de Erros e Logs Estruturados (Pino)
- Erros de API devem seguir rigorosamente a **RFC 9457 (Problem Details)**:
```json
{ "type": "about:blank", "title": "Bad Request", "status": 400, "detail": "Erro", "instance": "/v1/recurso" }
```
- Logs devem ser gerados em JSON estruturado com Pino e conter obrigatoriamente:
```json
{ "timestamp": "...", "level": "info", "correlationId": "uuid", "event": "order.created", "message": "..." }
```
- **Auditoria de Operações Críticas:** Toda alteração de preço, estoque, cancelamento de pedido ou permissões deve gerar log de auditoria no formato:
```json
{ "usuario": "...", "objeto": "...", "acao": "...", "payload": {}, "timestamp": "..." }
```

## 4. Stack Tecnológica e Monorepo

```text
apps/
 ├── frontend/      # Next.js 16+ (App Router), TS, Vanilla CSS, Pino
 └── backend/       # NestJS 11+, TS, Prisma 7+, PostgreSQL 15+, nestjs-pino, OTel
infra/              # Terraform (Cenários 1, 2 e 3)
docs/               # Documentação técnica (@docs)
```

### Context7 MCP para Documentação Atualizada
Se precisar utilizar bibliotecas ou APIs cujas versões mudaram (ex: NestJS 11+, Next.js 16+, Prisma 7+), consulte o servidor MCP do **Context7** para obter documentação, assinaturas de API e exemplos atualizados antes de codificar.

## 5. Comportamento Geral (Karpathy Style)
- **Pense Antes de Codificar:** Declare suas premissas. Se houver ambiguidade ou múltiplas abordagens, pare e pergunte ao usuário.
- **Simplicidade Primeiro:** Escreva o menor código possível. Evite abstrações especulativas.
- **Execução Focada em Metas:** Escreva ou atualize os testes antes de implementar a lógica de negócio e valide-os em loop até passar.

## 6. Referências e Aprendizado Contínuo
- **Documentação de Referência:**
  - Especificação Funcional e Entidades: [spec.md](file:///Users/vntcaha/Desktop/Puc%20Minas/Ci:Cd,%20Pipelines%20e%20Testes%20Automatizados/Exerc%C3%ADcios/Projeto%20cicd/docs/spec.md)
  - Diretrizes de Arquitetura e Segurança: [architecture.md](file:///Users/vntcaha/Desktop/Puc%20Minas/Ci:Cd,%20Pipelines%20e%20Testes%20Automatizados/Exerc%C3%ADcios/Projeto%20cicd/docs/architecture.md)
  - Decisões Arquiteturais (ADA): [ada.md](file:///Users/vntcaha/Desktop/Puc%20Minas/Ci:Cd,%20Pipelines%20e%20Testes%20Automatizados/Exerc%C3%ADcios/Projeto%20cicd/docs/ada.md)
  
- **Ciclo de Aprendizado Contínuo:**
  Ao final de cada tarefa concluída, faça uma breve reflexão sobre as decisões tomadas, identifique pontos problemáticos recorrentes e sugira melhorias ou atualizações para este arquivo `AGENTS.md` a fim de aprimorar a autonomia de futuros agentes.
