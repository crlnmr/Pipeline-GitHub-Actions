## ADDED Requirements

### Requirement: Admin cria categoria

O sistema SHALL permitir que um usuário autenticado com role ADMIN crie uma categoria.

- **Endpoint**: `POST /v1/categories`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Body**: `{ name: string }` validado com `class-validator` (`@IsString()`, `@IsNotEmpty()`, `@MaxLength(100)`)
- **Resposta 201**: `{ id: string, name: string, active: boolean, createdAt: string, updatedAt: string }`
- **Resposta 409**: `{ type: "about:blank", title: "Conflict", status: 409, detail: "Category name already exists" }`

#### Scenario: Cria categoria com nome válido
- **WHEN** um ADMIN envia `POST /v1/categories` com `{ "name": "Bebidas" }`
- **THEN** o sistema retorna `201 Created` com a categoria criada contendo `name: "Bebidas"`

#### Scenario: Cria categoria com nome duplicado
- **WHEN** um ADMIN envia `POST /v1/categories` com um nome já existente
- **THEN** o sistema retorna `409 Conflict` com Problem Details indicando nome duplicado

#### Scenario: Cria categoria sem token
- **WHEN** um usuário não autenticado envia `POST /v1/categories`
- **THEN** o sistema retorna `401 Unauthorized`

#### Scenario: Cria categoria com token CUSTOMER
- **WHEN** um usuário com role CUSTOMER envia `POST /v1/categories`
- **THEN** o sistema retorna `403 Forbidden`

### Requirement: Admin lista todas as categorias

O sistema SHALL permitir que um usuário autenticado com role ADMIN liste todas as categorias (ativas e inativas) com paginação.

- **Endpoint**: `GET /v1/categories`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Query params**: `page`, `limit`, `sort`, `order`, `search`
- **Resposta 200**: `{ data: Category[], meta: { page, limit, total, totalPages } }`

#### Scenario: Lista categorias paginadas
- **WHEN** um ADMIN envia `GET /v1/categories?page=1&limit=10`
- **THEN** o sistema retorna `200 OK` com lista paginada de categorias

#### Scenario: Lista categorias com filtro por nome
- **WHEN** um ADMIN envia `GET /v1/categories?search=beb`
- **THEN** o sistema retorna apenas categorias cujo nome contenha "beb" (case insensitive)

### Requirement: Público lista categorias ativas

O sistema SHALL permitir que qualquer visitante (sem autenticação) liste apenas categorias ativas.

- **Endpoint**: `GET /v1/categories`
- **Auth**: Nenhum (público)
- **Resposta 200**: Lista paginada contendo apenas categorias com `active = true`

#### Scenario: Visitante lista categorias ativas
- **WHEN** um visitante não autenticado envia `GET /v1/categories`
- **THEN** o sistema retorna `200 OK` com apenas categorias ativas

### Requirement: Admin atualiza categoria

O sistema SHALL permitir que um ADMIN atualize o nome e/ou status de uma categoria.

- **Endpoint**: `PATCH /v1/categories/:id`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Body**: `{ name?: string, active?: boolean }`
- **Resposta 200**: Categoria atualizada
- **Resposta 404**: `{ type: "about:blank", title: "Not Found", status: 404 }`
- **Auditoria**: `@Audit()` quando nome é alterado

#### Scenario: Atualiza nome da categoria
- **WHEN** um ADMIN envia `PATCH /v1/categories/:id` com `{ "name": "Bebidas Geladas" }`
- **THEN** o sistema retorna `200 OK` com a categoria atualizada

#### Scenario: Atualiza categoria inexistente
- **WHEN** um ADMIN envia `PATCH /v1/categories/:id` com um ID inexistente
- **THEN** o sistema retorna `404 Not Found`

### Requirement: Admin remove categoria

O sistema SHALL permitir que um ADMIN remova uma categoria, desde que não possua produtos ativos associados.

- **Endpoint**: `DELETE /v1/categories/:id`
- **Auth**: `JwtAuthGuard` + `@Roles(Role.ADMIN)`
- **Resposta 204**: No content (sucesso)
- **Resposta 404**: Categoria inexistente
- **Resposta 409**: Categoria possui produtos ativos

#### Scenario: Remove categoria sem produtos
- **WHEN** um ADMIN envia `DELETE /v1/categories/:id` e a categoria não possui produtos associados
- **THEN** o sistema retorna `204 No Content`

#### Scenario: Remove categoria com produtos ativos
- **WHEN** um ADMIN envia `DELETE /v1/categories/:id` e a categoria possui produtos ativos
- **THEN** o sistema retorna `409 Conflict` com detail "Cannot delete category with active products"

#### Scenario: Remove categoria inexistente
- **WHEN** um ADMIN envia `DELETE /v1/categories/:id` com um ID inexistente
- **THEN** o sistema retorna `404 Not Found`
