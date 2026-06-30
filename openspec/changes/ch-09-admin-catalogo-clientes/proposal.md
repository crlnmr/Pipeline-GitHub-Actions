# CH-09 — Admin: Gestão de Catálogo, Clientes e Pedidos (RF-03, RF-04, RF-05, RF-06)

## Descrição

Implementação das telas administrativas: Gestão de Categorias, Gestão de Produtos, Gestão de Clientes e Gestão de Pedidos (incluindo registro de pagamento). Baseado nos protótipos Stitch devai: "SeWAI Gestão de Categorias", "SeWAI Gestão de Produtos", "SeWAI Gestão de Clientes" e "SeWAI Gestão de Pedidos".

## Protótipos de Referência (Stitch devai)

- **SeWAI Gestão de Categorias** — listagem com nome/ativo, comandos: cadastrar, pesquisar, editar, excluir
- **SeWAI Gestão de Produtos** — listagem com nome/imagem/preço/estoque/categoria/ativo, CRUD
- **SeWAI Gestão de Clientes** — listagem com nome/e-mail/telefone, CRUD
- **SeWAI Gestão de Pedidos** — filtro por status, atualizar status, detalhar, registrar pagamento

## RFs e RNFs Afetados

- **RF-03** Gestão de Categorias
- **RF-04** Gestão de Produtos
- **RF-05** Gestão de Clientes
- **RF-06** Gestão de Pedidos
- **RNF-01** Segurança (acesso exclusivo ADMIN)

## Non-goals

- Dashboard financeiro (CH-10).
- Upload de imagem (URL no MVP).
- CRM avançado.

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Layout admin | `app/(admin)/layout.tsx` com nav lateral: Categorias, Produtos, Clientes, Pedidos, Dashboard |
| `app/(admin)/categories/` | Listagem + modal criar/editar + confirmação de exclusão |
| `app/(admin)/products/` | Listagem + formulário criar/editar (nome, imagem URL, descrição, preço, estoque, categoria, ativo) |
| `app/(admin)/customers/` | Listagem + formulário criar/editar (nome, endereço, e-mail, telefone) |
| `app/(admin)/orders/` | Listagem com filtro por status + modal detalhe + transição de status + registro de pagamento |
| `components/DataTable` | Componente de tabela genérico com paginação e pesquisa |
| `components/Modal` | Modal genérico reutilizável para formulários e confirmações |
| Serviços | `categories.service.ts`, `products.service.ts`, `customers.service.ts`, `orders.service.ts` (operações admin) |

## Dependências

- **CH-02** (autenticação ADMIN — guard de rota)
- **CH-04** (API de catálogo)
- **CH-06** (API de clientes)
- **CH-07** (API de pedidos)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Formulário de produto com muitos campos — UX complexa | Média | Dividir em steps se necessário; MVP: tudo em um formulário simples |
| Conflito entre exclusão de categoria e produtos vinculados | Baixa | Frontend exibe erro 409 do backend com mensagem clara |
| Registro de pagamento com valor incorreto | Baixa | Campo de valor com validação de número positivo e confirmação antes de submeter |

## Execução de Linter

```bash
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `DataTable` | Renderiza colunas e dados corretamente |
| `DataTable` | Paginação funcional |
| `Modal` | Abre e fecha ao clicar em backdrop |
| `CategoryForm` | Valida campo nome obrigatório |
| `ProductForm` | Valida preço positivo e estoque ≥ 0 |
| `CustomerForm` | Valida e-mail com formato correto |
| `OrderStatusBadge` | Exibe status correto com cor semântica |
| `categories.service.createCategory()` | Chama `POST /v1/categories` |
| `orders.service.registerPayment()` | Chama `POST /v1/orders/:id/payments` |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `/admin/categories` | Renderiza com dados de `GET /v1/categories` |
| `/admin/products` | Criação de produto chama API corretamente |
| `/admin/customers` | Exclusão com pedidos exibe erro 409 |
| `/admin/orders` | Filtro por status atualiza listagem |
| Registro de pagamento | Chama API e atualiza status do pedido na tela |

## Testes E2E (Playwright)

| Escopo | Teste |
|---|---|
| CRUD categoria | Admin cria, edita e exclui categoria |
| CRUD produto | Admin cria produto com todos os campos |
| Gestão de pedidos | Admin filtra pedidos por status e transiciona status |
| Registro de pagamento | Admin registra pagamento manual — pedido fica Pago |
| Acesso sem ADMIN | Redireciona para `/login` ou exibe 403 |

## Critério de Conclusão

- [ ] `npm run lint --workspace=frontend` sem erros
- [ ] `npm run test --workspace=frontend` verde
- [ ] Cobertura frontend ≥ 70%
- [ ] E2E de CRUD e gestão de pedidos passando
