## 1. Schema e Migration

- [x] 1.1 Adicionar modelos `Category` e `Product` ao `schema.prisma`
- [x] 1.2 Executar `prisma migrate dev --name add_catalog_tables`
- [x] 1.3 Gerar Prisma Client (`prisma generate`)

## 2. Scaffold do Módulo Catalog

- [x] 2.1 Criar `catalog.module.ts` com imports do PrismaModule e AuditModule
- [x] 2.2 Criar estrutura de pastas: dto/, controllers/, services/, tests/

## 3. DTOs e Validação

- [x] 3.1 Criar `CreateCategoryDto` com validação (name: string, @IsNotEmpty, @MaxLength(100))
- [x] 3.2 Criar `UpdateCategoryDto` com campos opcionais (name?, active?)
- [x] 3.3 Criar `CreateProductDto` com validações (name, categoryId, price, stock?, imageUrl?, description?)
- [x] 3.4 Criar `UpdateProductDto` com todos os campos opcionais
- [x] 3.5 Criar `CatalogQueryDto` com page, limit, sort, order, search, categoryId

## 4. Categories Service

- [x] 4.1 Implementar `CategoriesService.create()` com verificação de unicidade
- [x] 4.2 Implementar `CategoriesService.findAll()` (admin: todas; público: apenas ativas) com paginação e filtro search
- [x] 4.3 Implementar `CategoriesService.findById()`
- [x] 4.4 Implementar `CategoriesService.update()` com auditoria via @Audit() se nome mudar
- [x] 4.5 Implementar `CategoriesService.remove()` com verificação de produtos ativos associados
- [x] 4.6 Escrever testes unitários do CategoriesService (criação, duplicidade, remoção com/sem produtos)

## 5. Categories Controller

- [x] 5.1 Implementar `POST /v1/categories` com JwtAuthGuard + Roles(ADMIN)
- [x] 5.2 Implementar `GET /v1/categories` (sem auth para público; com auth admin retorna tudo)
- [x] 5.3 Implementar `PATCH /v1/categories/:id` com JwtAuthGuard + Roles(ADMIN)
- [x] 5.4 Implementar `DELETE /v1/categories/:id` com JwtAuthGuard + Roles(ADMIN) e verificação 409
- [x] 5.5 Escrever testes de integração do CategoriesController

## 6. Products Service

- [x] 6.1 Implementar `ProductsService.create()` com validação de categoria existente
- [x] 6.2 Implementar `ProductsService.findAll()` (admin: todos; público: apenas active=true) com paginação, search, categoryId
- [x] 6.3 Implementar `ProductsService.findById()`
- [x] 6.4 Implementar `ProductsService.update()` com auditoria via @Audit() para price/stock
- [x] 6.5 Implementar `ProductsService.remove()`
- [x] 6.6 Escrever testes unitários do ProductsService (criação, atualização com auditoria, filtro de ativos)

## 7. Products Controller

- [x] 7.1 Implementar `POST /v1/products` com JwtAuthGuard + Roles(ADMIN)
- [x] 7.2 Implementar `GET /v1/products` público (apenas ativos) e admin (todos)
- [x] 7.3 Implementar `GET /v1/products/:id` público
- [x] 7.4 Implementar `PATCH /v1/products/:id` com JwtAuthGuard + Roles(ADMIN)
- [x] 7.5 Implementar `DELETE /v1/products/:id` com JwtAuthGuard + Roles(ADMIN)
- [x] 7.6 Escrever testes de integração do ProductsController

## 8. Swagger e OpenAPI

- [x] 8.1 Decorar CategoriesController com @ApiTags, @ApiOperation, @ApiResponse
- [x] 8.2 Decorar ProductsController com @ApiTags, @ApiOperation, @ApiResponse
- [x] 8.3 Decorar DTOs com @ApiProperty

## 9. Verificação Final

- [x] 9.1 Executar `npm run lint --workspace=backend` sem erros
- [x] 9.2 Executar `npm run test --workspace=backend` verde
- [x] 9.3 Verificar cobertura ≥ 80% linhas e branches
