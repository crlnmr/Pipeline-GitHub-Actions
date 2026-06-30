# DevAI — Plataforma de Micro-Commerce

O **DevAI** é uma plataforma de e-commerce completa (full-stack) projetada para microempreendedores. Ele resolve um problema crítico comum: a perda de vendas, pedidos e clientes decorrentes de processos manuais e desorganizados de atendimento e vendas que se iniciam em redes sociais. 

O produto oferece um fluxo duplo simplificado: uma vitrine digital profissional para os clientes realizarem seus pedidos com facilidade e um painel de gestão centralizado para o empreendedor controlar suas vendas do pedido ao pagamento.

---

## 📌 Sumário
- [Diferenciais do Produto](#-diferenciais-do-produto)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura de Software](#-arquitetura-de-software)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Como Começar](#-como-começar)
  - [Pré-requisitos](#pré-requisitos)
  - [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
  - [Executando a Aplicação](#executando-a-aplicação)
- [Estratégias de Deploy](#-estratégias-de-deploy)
- [Contribuição](#-contribuição)

---

## ⚡ Diferenciais do Produto

- **Simplicidade Radical:** Foco em adoção imediata e zero complexidade técnica para o empreendedor.
- **Vitrine Profissional:** Credibilidade instantânea por meio de um catálogo de produtos limpo, responsivo e visualmente impactante.
- **Controle Financeiro Completo:** Eliminação da inadimplência e das perdas de pedidos por esquecimento ou falta de registro.

---

## 👥 Perfis de Usuário

### 1. Administrador (Empreendedor)
*   **Problemas:** Sofre com a perda de vendas e sobrecarga devido a processos manuais.
*   **Objetivos:** Realizar a gestão centralizada das vendas através do fluxo de pedidos e pagamentos, além de gerenciar produtos, estoques, categorias e dados dos clientes.
*   **Motivações:** Oferecer uma experiência de compra ágil e confiável para reter e encantar seus clientes.

### 2. Cliente
*   **Problemas:** Dificuldade em visualizar o catálogo e fazer pedidos rápidos.
*   **Objetivos:** Realizar pedidos de forma transparente, rápida e simples.

---

## 🛠 Funcionalidades Principais

### RF-01: Vitrine de Produtos (Catálogo)
- Visualização dos produtos ativos em um catálogo organizado.
- Exibição de informações como nome, descrição, preço, categoria e imagens.
- **Regras de Negócio:** Produtos inativos são ocultados. Produtos sem estoque são visualizáveis, mas não podem ser adicionados ao carrinho.

### RF-02: Criação e Acompanhamento de Pedidos
- Criação de pedidos com seleção de produtos e quantidades.
- Cálculo automático do valor total do pedido.
- Histórico de pedidos para clientes autenticados.
- Cancelamento de pedidos ainda não pagos.
- **Fluxo de Estados do Pedido:**
  
  $$\text{Novo} \longrightarrow \text{Pago} \longrightarrow \text{Preparação} \longrightarrow \text{Faturado} \longrightarrow \text{Despachado} \longrightarrow \text{Entregue}$$
  
  *(Nota: Um pedido pode ser **Cancelado** a partir de qualquer estado intermediário, exceto **Entregue**).*
- **Regras de Negócio:** Apenas administradores registram pagamentos. Validação rígida de estoque no momento da criação e confirmação.

### RF-03 & RF-04: Gestão de Produtos e Categorias
- Criação, edição e exclusão de produtos e categorias (restrito a perfis administradores).

---

## 🏛 Arquitetura de Software

A arquitetura do DevAI foi projetada sob o estilo **Backend for Frontend (BFF)** e **Backend como Fonte Única de Verdade**, onde:
- **Toda regra de negócio** reside exclusivamente no backend NestJS.
- O frontend Next.js atua apenas como camada de visualização e interage com as APIs de negócio. É proibido o acesso direto do frontend ao banco de dados ou ORM.
- **Segurança baseada em JWT:** Autenticação descentralizada via Clerk.
- **Padronização de Erros:** Respostas de erro expostas pela API seguem a especificação **RFC 9457 (Problem Details)**.

---

## 💻 Stack Tecnológica

### Frontend
- **Framework:** Next.js 16+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Vanilla CSS (Design conceitual baseado na estética de alto contraste, tipografia display e geometria de pílula)

### Backend
- **Framework:** NestJS 11+
- **Linguagem:** TypeScript (Node.js 24+)
- **ORM:** Prisma 7+
- **Banco de Dados:** PostgreSQL 15+

### Integrações e DevOps
- **Provedor de Identidade (Auth):** Clerk
- **Mensageria (Futuro):** AWS SQS
- **Cache (Futuro):** Redis / AWS ElastiCache
- **Provisionamento:** Terraform
- **CI/CD:** GitHub Actions
- **Containerização:** Docker (Compatível com OCI)

---

## 📂 Estrutura do Monorepo

```text
apps/
 ├── frontend/           # Aplicação Next.js 16+
 │     └── src/
 │          ├── app/               # Rotas e páginas (App Router)
 │          ├── components/        # Componentes UI reutilizáveis
 │          ├── features/          # Módulos de domínio do frontend
 │          ├── services/          # Camada de comunicação com APIs do Backend
 │          └── types/             # Definições de tipos TypeScript
 └── backend/            # Aplicação NestJS 11+
       └── src/
            ├── core/              # Módulos transversais (Auth, DB, Observabilidade)
            └── modules/           # Módulos de negócio (Catalog, Orders, Customers)
infra/                   # Arquivos de infraestrutura do Terraform
docs/                    # Documentação detalhada da plataforma
.env                     # Arquivo de configuração de ambiente do projeto
```

---

## 🚀 Como Começar

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 24 ou superior)
- **npm** (compatível com Workspaces)
- **Docker** e **Docker Compose**
- Uma instância local ou em nuvem do **PostgreSQL 15+**

### Configuração de Variáveis de Ambiente
Renomeie ou crie um arquivo `.env` com base no arquivo [.env](.env) disponível na raiz e configure as seguintes variáveis:

```env
PROJECT_NAME=devai-commerce
GLOBAL_PREFIX=api/v1

# Autenticação Clerk (Obter no dashboard do Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=sua_chave_publica
CLERK_SECRET_KEY=seu_segredo
CLERK_JWT_KEY="sua_chave_jwks_publica"

# Configuração do Banco de Dados PostgreSQL/Supabase
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?schema=public"
DIRECT_URL="postgresql://usuario:senha@host:porta/banco?schema=public"

# Portas da Aplicação
FRONTEND_PORT=3000
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Executando a Aplicação

1. Instale as dependências do monorepo na raiz do projeto:
   ```bash
   npm install
   ```

2. Execute o banco de dados via Docker (caso utilize configuração local):
   ```bash
   docker compose up -d db
   ```

3. Execute as migrações do banco de dados (Prisma):
   ```bash
   npm run prisma:migrate:dev --workspace=backend
   ```

4. Inicie o ambiente de desenvolvimento (Frontend e Backend simultaneamente):
   ```bash
   npm run dev
   ```

---

## ☁ Estratégias de Deploy

A plataforma está preparada para evoluir em três cenários de infraestrutura na AWS, provisionados via Terraform:

| Aspecto | Cenário 1 (Básico / MVP) | Cenário 2 (Intermediário / V1.0) | Cenário 3 (Avançado / Cloud Native) |
| :--- | :--- | :--- | :--- |
| **Custo Estimado** | ~$25–30 / mês | ~$145–170 / mês | ~$390–470 / mês |
| **Disponibilidade** | Single AZ (~95%) | Multi-AZ (~99.5%) | Multi-AZ (~99.9%+) |
| **Computação** | EC2 única com Docker Compose | ECS Fargate (Serviço Gerenciado) | ECS Fargate com Auto Scaling elástico |
| **Banco de Dados** | RDS PostgreSQL (Single AZ) | RDS PostgreSQL (Multi-AZ) | RDS PostgreSQL (Multi-AZ) + Read Replica |
| **Roteamento & CDN** | Nginx local | Application Load Balancer + CloudFront | ALB com WAF + CloudFront CDN |
| **Mensageria** | Não possui | Não possui | AWS SQS (Processamento assíncrono) |
| **Cache** | Não possui | Não possui | AWS ElastiCache Redis |

---

## 🤝 Contribuição

Este projeto faz parte do módulo de **CI/CD, Pipelines e Testes Automatizados** da **PUC Minas**. 
Para contribuir:
1. Faça o fork do repositório.
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas alterações (`git commit -am 'Adiciona nova funcionalidade'`).
4. Envie para o repositório remoto (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.
