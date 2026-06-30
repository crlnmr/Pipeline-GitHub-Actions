## ADDED Requirements

### Requirement: Admin cria produto

O sistema SHALL permitir que um usuário autenticado com role ADMIN crie um produto.

- **Endpoint**: `POST /v1/products`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Body**: `{ name: string, categoryId: string, imageUrl?: string, description?: string, price: number, stock?: number }`
- **Validações**: `name` (`@IsString`, `@IsNotEmpty`, `@MaxLength(200)`), `categoryId` (`@IsUUID`, `@IsNotEmpty`), `imageUrl` (`@IsOptional`, `@IsUrl`), `price` (`@IsNumber`, `@Min(0.01)`, `@Max(999999.99)`), `stock` (`@IsOptional`, `@IsInt`, `@Min(0)`)
- **Resposta 201**: Produto criado
- **Resposta 404**: Categoria informada não existe

#### Scenario: Cria produto com todos os campos válidos
- **WHEN** um ADMIN envia `POST /v1/products` com `{ "name": "Coca-Cola 350ml", "categoryId": "<uuid>", "price": 5.50, "stock": 100 }`
- **THEN** o sistema retorna `201 Created` com o produto criado

#### Scenario: Cria produto com categoria inexistente
- **WHEN** um ADMIN envia `POST /v1/products` com `categoryId` de uma categoria que não existe
- **THEN** o sistema retorna `404 Not Found`

#### Scenario: Cria produto com preço zero
- **WHEN** um ADMIN envia `POST /v1/products` com `price: 0`
- **THEN** o sistema retorna `400 Bad Request` com erro de validação

### Requirement: Público lista produtos ativos

O sistema SHALL permitir que qualquer visitante liste produtos com `active = true`, com paginação e filtros.

- **Endpoint**: `GET /v1/products`
- **Auth**: Nenhum (público)
- **Query params**: `page`, `limit`, `sort`, `order`, `search`, `categoryId`
- **Resposta 200**: `{ data: Product[], meta: { page, limit, total, totalPages } }`
- **Regra**: Produtos com `active = false` NEVER aparecem nesta listagem

#### Scenario: Visitante lista produtos ativos
- **WHEN** um visitante envia `GET /v1/products`
- **THEN** o sistema retorna `200 OK` com apenas produtos com `active = true`

#### Scenario: Visitante filtra produtos por categoria
- **WHEN** um visitante envia `GET /v1/products?categoryId=<uuid>`
- **THEN** o sistema retorna apenas produtos ativos da categoria informada

#### Scenario: Visitante busca produtos por nome
- **WHEN** um visitante envia `GET /v1/products?search=coca`
- **THEN** o sistema retorna produtos ativos cujo nome contenha "coca"

### Requirement: Admin lista todos os produtos

O sistema SHALL permitir que um ADMIN liste todos os produtos (ativos e inativos) com paginação e filtros.

- **Endpoint**: `GET /v1/products`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Resposta 200**: Lista paginada incluindo produtos inativos

#### Scenario: Admin lista todos os produtos
- **WHEN** um ADMIN envia `GET /v1/products`
- **THEN** o sistema retorna `200 OK` com todos os produtos, incluindo inativos

### Requirement: Consulta produto por ID

O sistema SHALL permitir consultar um produto específico pelo seu ID.

- **Endpoint**: `GET /v1/products/:id`
- **Auth**: Nenhum (público)
- **Resposta 200**: Produto encontrado
- **Resposta 404**: Produto inexistente

#### Scenario: Consulta produto existente
- **WHEN** um visitante envia `GET /v1/products/:id` com um ID válido
- **THEN** o sistema retorna `200 OK` com os dados do produto

#### Scenario: Consulta produto inexistente
- **WHEN** um visitante envia `GET /v1/products/:id` com um ID inexistente
- **THEN** o sistema retorna `404 Not Found` com Problem Details

### Requirement: Admin atualiza produto

O sistema SHALL permitir que um ADMIN atualize os dados de um produto.

- **Endpoint**: `PATCH /v1/products/:id`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Body**: `{ name?, categoryId?, imageUrl?, description?, price?, stock?, active? }`
- **Resposta 200**: Produto atualizado
- **Resposta 404**: Produto inexistente
- **Auditoria**: `@Audit()` disparado quando `price` ou `stock` são alterados

#### Scenario: Atualiza preço do produto
- **WHEN** um ADMIN envia `PATCH /v1/products/:id` com `{ "price": 6.00 }`
- **THEN** o sistema retorna `200 OK` com o produto atualizado e um log de auditoria é registrado

#### Scenario: Atualiza estoque do produto
- **WHEN** um ADMIN envia `PATCH /v1/products/:id` com `{ "stock": 50 }`
- **THEN** o sistema retorna `200 OK` e um log de auditoria é registrado

#### Scenario: Atualiza produto inexistente
- **WHEN** um ADMIN envia `PATCH /v1/products/:id` com um ID inexistente
- **THEN** o sistema retorna `404 Not Found`

### Requirement: Admin remove produto

O sistema SHALL permitir que um ADMIN remova um produto.

- **Endpoint**: `DELETE /v1/products/:id`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Resposta 204**: Produto removido
- **Resposta 404**: Produto inexistente

#### Scenario: Remove produto existente
- **WHEN** um ADMIN envia `DELETE /v1/products/:id` com um ID válido
- **THEN** o sistema retorna `204 No Content`

#### Scenario: Remove produto inexistente
- **WHEN** um ADMIN envia `DELETE /v1/products/:id` com um ID inexistente
- **THEN** o sistema retorna `404 Not Found`
