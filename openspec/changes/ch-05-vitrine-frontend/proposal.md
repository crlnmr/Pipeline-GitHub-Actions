# CH-05 — Vitrine de Produtos (Frontend — RF-01 + RF-02 parcial)

## Descrição

Implementação das telas da vitrine pública: página principal com catálogo de produtos, carrinho de compras, página de login e fluxo de criação de pedido pelo cliente. Baseado nos protótipos "SeWAI Vitrine Principal", "SeWAI Carrinho de Compras" e "SeWAI Login" do projeto Stitch devai.

## Protótipos de Referência (Stitch devai)

- **SeWAI Vitrine Principal** — busca de produtos, listagem em grid, filtro por categoria, adicionar ao carrinho
- **SeWAI Carrinho de Compras** — lista de itens, quantidade, valor total, confirmar pedido, excluir item
- **SeWAI Login** — e-mail, senha, entrar, criar conta

## RFs e RNFs Afetados

- **RF-01** Vitrine de Produtos
- **RF-02** Criação e Acompanhamento de Pedidos (parcial — criação pelo cliente)
- **RNF-01** Segurança (formulário de login próprio, sem SDK Clerk)

## Non-goals

- Acompanhamento de pedidos do cliente (CH-08).
- Funcionalidades de admin (CH-09, CH-10).
- Upload de imagem de produto (URL apenas no MVP).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| `app/(public)/page.tsx` | Vitrine principal: grid de produtos, busca, filtro por categoria |
| `app/(public)/login/page.tsx` | Formulário login próprio integrado com backend BFF |
| `components/ProductCard` | Card de produto com nome, imagem, preço, botão "Adicionar ao carrinho" |
| `components/Cart` | Drawer/sidebar de carrinho (itens, quantidade, total, confirmar, excluir) |
| `services/catalog.service.ts` | `getProducts()`, `getCategories()` — chamadas para `GET /v1/products` e `GET /v1/categories` |
| `services/orders.service.ts` | `createOrder()` — chama `POST /v1/orders` |
| `hooks/useCart` | Estado do carrinho (client-side, sem persistência local no MVP) |
| Design system | Aplicar tokens do design Nike-design-analysis: ink, canvas, soft-cloud, pill buttons, flat cards |

## Dependências

- **CH-01** (scaffold Next.js)
- **CH-02** (autenticação — login e proteção de rota do carrinho)
- **CH-04** (API de catálogo disponível)
- **CH-07** (API de pedidos disponível para `createOrder`)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Estado do carrinho perdido ao navegar | Baixa | Usar `localStorage` ou Context API como fallback simples no MVP |
| Produto sem estoque ainda exibido | Baixa | Backend retorna campo `estoque`; frontend desabilita botão quando `estoque = 0` |
| Race condition no carrinho (item adicionado duas vezes) | Baixa | Usar reducer pattern no `useCart` |

## Execução de Linter

```bash
npm run lint --workspace=frontend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `ProductCard` | Renderiza nome, preço e imagem |
| `ProductCard` | Botão desabilitado quando `estoque = 0` |
| `ProductCard` | Produto inativo não renderizado (filtrado pela API) |
| `useCart` | `addItem()` incrementa quantidade se produto já existe |
| `useCart` | `removeItem()` remove item do carrinho |
| `useCart` | `totalValue()` calcula soma correta dos itens |
| `LoginPage` | Exibe erro quando submit com campos vazios |
| `catalog.service` | `getProducts()` chama endpoint correto |

## Testes de Integração

| Escopo | Teste |
|---|---|
| Vitrine principal | `GET /v1/products` retorna dados que são renderizados no grid |
| Login | `POST /v1/auth/sign-in` chamado ao submeter formulário |
| Criar pedido | `POST /v1/orders` chamado ao confirmar carrinho com usuário autenticado |

## Testes E2E (Playwright)

| Escopo | Teste |
|---|---|
| Happy path vitrine | Usuário acessa `/`, vê produtos, adiciona ao carrinho, vê total |
| Happy path pedido | Usuário logado confirma carrinho e pedido é criado (verifica redirecionamento) |
| Produto sem estoque | Botão "Adicionar" desabilitado para produto com `estoque = 0` |
| Rota carrinho sem login | Redireciona para `/login` |
| Login inválido | Mensagem de erro exibida na tela |

## Critério de Conclusão

- [ ] `npm run lint --workspace=frontend` sem erros
- [ ] `npm run test --workspace=frontend` verde
- [ ] Cobertura frontend ≥ 70%
- [ ] E2E de vitrine e criação de pedido passando
- [ ] Design system aplicado (tokens ink/canvas/soft-cloud)
