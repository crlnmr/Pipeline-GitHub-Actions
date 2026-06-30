## Context

O módulo `catalog` será o primeiro módulo de domínio do backend e servirá de referência arquitetural para os demais módulos (orders, customers). O backend NestJS já possui estrutura base com autenticação (CH-02) e auditoria (CH-03). O schema Prisma inicial será estendido com as entidades `Category` e `Product`.

### Estado atual

- Módulo `core/auth` com JwtAuthGuard, RolesGuard e decorator `@Roles()`
- Módulo `core/audit` com AuditService e decorator `@Audit()`
- Prisma schema com tabelas de usuários/sessões do Clerk
- Banco PostgreSQL rodando via Docker Compose

## Goals / Non-Goals

**Goals:**

- Criar módulo `catalog` com service, controller, DTOs e módulo NestJS
- Estender schema Prisma com `Category` e `Product` + migration
- Implementar CRUD completo de categorias (admin) + listagem pública
- Implementar CRUD completo de produtos (admin) + listagem pública (apenas ativos)
- Proteger endpoints admin com `@Roles(Role.ADMIN)` + JwtAuthGuard
- Auditar alterações de preço e estoque via `@Audit()`
- Paginação, filtros e ordenação nas listagens
- Swagger/OpenAPI para todos os endpoints
- Testes unitários (service) e integração (controller) com cobertura ≥80%

**Non-Goals:**

- Frontend de catálogo (CH-05 vitrine, CH-09 admin)
- Upload de imagens (MVP aceita URL string)
- Cache ou mecanismos de performance na listagem pública
- Soft-delete (remoção física de categorias/produtos)
- Validação de unicidade de nome com escopo por tenant (sem multi-tenancy)

## Decisions

### 1. Estrutura do módulo catalog

```
backend/src/modules/catalog/
├── catalog.module.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── catalog-query.dto.ts
├── entities/
│   └── (respostas serializadas, se necessário)
├── controllers/
│   ├── categories.controller.ts
│   └── products.controller.ts
├── services/
│   ├── categories.service.ts
│   └── products.service.ts
└── tests/
    ├── categories.service.spec.ts
    ├── products.service.spec.ts
    ├── categories.controller.spec.ts
    └── products.controller.spec.ts
```

**Rationale**: Separação clara por entidade evita arquivos muito grandes e facilita navegação. Manter controllers e services em pastas separadas segue convenção NestJS padrão e é consistente com módulos futuros.

### 2. Endpoints separados por controller (categories vs products)

Dois controllers (`CategoriesController`, `ProductsController`) em vez de um `CatalogController`.

**Rationale**: Cada entidade tem seu próprio conjunto de endpoints com regras de autenticação distintas (categorias são exclusivamente admin; produtos têm listagem pública). A separação mantém cada controller coeso e com responsabilidade única.

### 3. Paginação via query params (page, limit, sort, order)

DTO `CatalogQueryDto` compartilhado:
```ts
class CatalogQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @IsEnum(['asc', 'desc']) order?: 'asc' | 'desc';
  @IsOptional() @IsString() search?: string;     // filtro por nome (LIKE)
  @IsOptional() @IsUUID() categoryId?: string;    // filtro por categoria (produtos)
}
```

**Rationale**: Parâmetros de query são o padrão REST para coleções paginadas. Valores default: page=1, limit=10, order='asc'.

### 4. Prisma schema — entidades Category e Product

```prisma
model Category {
  id        String    @id @default(uuid()) @db.Uuid
  name      String    @unique
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]
}

model Product {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  categoryId  String    @db.Uuid
  category    Category  @relation(fields: [categoryId], references: [id])
  imageUrl    String?
  description String?
  price       Decimal   @db.Decimal(10, 2)
  stock       Int       @default(0)
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Rationale**: `price` como `Decimal(10,2)` evita problemas de arredondamento de float. `stock` como `Int` com `@default(0)`. `name` de Category é único. `active` booleano para controle de ativação.

### 5. Validação de exclusão de categoria — verificação de produtos ativos

`DELETE /v1/categories/:id` verifica se existem produtos ativos associados. Se sim, retorna `409 Conflict` com Problem Details.

**Rationale**: Protege integridade referencial — categorias com produtos não devem ser removidas para evitar órfãos. O admin deve first desativar/remover os produtos.

### 6. Auditoria via decorator `@Audit()`

```ts
@Patch(':id')
@Audit({ action: 'product.price.updated', resource: 'Product' })
async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) { ... }
```

**Rationale**: O decorator `@Audit()` já implementado na CH-03 intercepta a resposta e registra a auditoria. Aplicamos nos métodos `updateProduct` (quando preço ou estoque mudam) e `updateCategory` (quando nome muda).

### 7. Respostas padronizadas — envelope de paginação

```ts
class PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Rationale**: Consistência entre endpoints de coleção. O frontend precisa de `total` e `totalPages` para renderizar paginação.

### 8. Alternativa considerada: GraphQL

Descartado por aumentar complexidade do MVP. REST é suficiente para o escopo atual e elimina custo de setup de GraphQL no NestJS.

### 9. Alternativa considerada: Soft-delete para categorias

Descartado por simplicidade do MVP. Como categorias sem produtos podem ser removidas fisicamente, não há necessidade de soft-delete. Se no futuro houver histórico, pode-se adicionar `deletedAt`.

## Risks / Trade-offs

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Nome duplicado de categoria causa `ConflictException` | Média | DTO valida unicidade via Prisma unique constraint; service captura `PrismaClientKnownRequestError` (P2002) |
| Produto com estoque negativo | Baixa | DTO valida `@Min(0)` no campo stock |
| Alteração de preço sem auditoria | Baixa | `@Audit()` no método PATCH com verificação de mudança de preço |
| Produto inativo referenciado em pedidos existentes | Baixa | Pedidos futuros (CH-06) devem consultar produto ativo no momento da adição ao carrinho |
| Categoria renomeada quebra produtos associados | Média | Renomear é seguro pois a relação é por ID; a migration usa chave estrangeira por UUID |

## Migration Plan

1. **Schema**: Adicionar modelos `Category` e `Product` ao `schema.prisma`
2. **Migration**: `npx prisma migrate dev --name add_catalog_tables`
3. **Seed** (opcional): Criar script seed.json com categorias e produtos de exemplo
4. **Rollback**: `npx prisma migrate reset` (apenas dev); em produção, migration reversa deve ser criada manualmente
