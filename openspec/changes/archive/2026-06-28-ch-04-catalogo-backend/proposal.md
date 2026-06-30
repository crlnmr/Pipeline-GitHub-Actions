# CH-04 — Catálogo: Backend (Categorias e Produtos)

## Descrição

Implementação do módulo `catalog` no backend NestJS com CRUD completo de Categorias e Produtos. Inclui migration Prisma, endpoints versionados REST, paginação, filtros e regras de negócio do catálogo (produto inativo não aparece na vitrine, estoque).

## RFs e RNFs Afetados

- **RF-03** Gestão de Categorias
- **RF-04** Gestão de Produtos
- **RF-01** Vitrine de Produtos (parcial — apenas API pública de listagem)
- **RNF-01** Segurança (endpoints admin protegidos por RBAC)
- **RNF-02** Auditoria (alteração de preço e estoque)

## Non-goals

- Frontend da vitrine (CH-05) e frontend admin (CH-09).
- Upload de imagem de produto (armazenamento S3 é evolução futura; MVP aceita URL de imagem).

## Escopo Funcional

| Área | O que será entregue |
|---|---|
| Migration | Tabelas `Category` e `Product` com Prisma 7+ |
| Categorias | `GET /v1/categories` (público, paginado), `POST /v1/categories`, `PATCH /v1/categories/:id`, `DELETE /v1/categories/:id` (ADMIN) |
| Produtos | `GET /v1/products` (público, filtra inativos), `GET /v1/products/:id`, `POST /v1/products`, `PATCH /v1/products/:id`, `DELETE /v1/products/:id` (ADMIN) |
| DTOs | `CreateCategoryDto`, `UpdateCategoryDto`, `CreateProductDto`, `UpdateProductDto` com `class-validator` |
| Regras | Produto inativo excluído da listagem pública; estoque ≥ 0 obrigatório |
| Auditoria | `@Audit()` em alteração de preço e estoque |
| Swagger | Todos os endpoints decorados com `@ApiOperation`, `@ApiResponse` |

## Dependências

- **CH-01** (monorepo base)
- **CH-02** (JwtAuthGuard e RBAC para rotas admin)
- **CH-03** (AuditService para alterações de preço/estoque)

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Migration incompatível com dados existentes em dev | Baixa | Ambiente de dev é efêmero via Docker; usar `prisma migrate reset` se necessário |
| Validação de estoque com concorrência | Baixa | MVP single-user admin; transações Prisma usadas nas operações de escrita |
| URL de imagem sem validação de formato | Baixa | DTO valida `@IsUrl()` no campo imagem |

## Execução de Linter

```bash
npm run lint --workspace=backend
```

## Testes Unitários

| Escopo | Teste |
|---|---|
| `CatalogService.createCategory()` | Cria categoria com nome válido |
| `CatalogService.createCategory()` | Lança `ConflictException` para nome duplicado |
| `CatalogService.deleteCategory()` | Remove categoria sem produtos associados |
| `CatalogService.deleteCategory()` | Lança `ConflictException` se há produtos ativos |
| `CatalogService.createProduct()` | Cria produto com todos os campos válidos |
| `CatalogService.updateProduct()` | Atualiza preço e dispara auditoria |
| `CatalogService.listPublicProducts()` | Retorna apenas produtos ativos |
| `CatalogService.listPublicProducts()` | Exclui produtos com `ativo = false` |

## Testes de Integração

| Escopo | Teste |
|---|---|
| `GET /v1/products` | Retorna lista paginada de produtos ativos (sem auth) |
| `POST /v1/products` | Cria produto com token ADMIN (201) |
| `POST /v1/products` | Retorna 403 com token CUSTOMER |
| `POST /v1/products` | Retorna 401 sem token |
| `PATCH /v1/products/:id` | Atualiza estoque e retorna 200 |
| `GET /v1/products/:id` | Retorna 404 para produto inexistente (Problem Details RFC 9457) |
| `DELETE /v1/categories/:id` | Retorna 409 se categoria tem produtos |

## Testes E2E

- Não aplicável nesta mudança (sem frontend). E2E do catálogo será validado na CH-05 (vitrine) e CH-09 (admin).

## Critério de Conclusão

- [ ] `npm run lint --workspace=backend` sem erros
- [ ] `npm run test --workspace=backend` verde
- [ ] Cobertura backend ≥ 80%
- [ ] Migration Prisma aplicada sem erros
- [ ] Swagger documentado e acessível em `/api`
