# Plano de Testes — Fluxo de Login

## 1. Informações Gerais

| Campo            | Detalhe                                    |
| ---------------- | ------------------------------------------ |
| **Funcionalidade** | Autenticação de usuários                  |
| **Módulo**        | Auth (core)                                |
| **Rota (UI)**    | `/login`                                   |
| **API**          | `POST /api/v1/auth/sign-in`                |
| **Provedor de identidade** | Clerk (integrado via backend NestJS) |
| **Tipo de teste** | E2E (Playwright)                           |

---

## 2. Pré-condições (Estado Inicial)

Assumir estado fresco/limpo para todos os cenários:

- Banco de dados PostgreSQL rodando via Docker
- Aplicação frontend em execução (`npm run dev`)
- Backend NestJS em execução
- Clerk dev instance configurada e acessível
- Navegador sem cookies ou sessão pré-existente
- Usuário de teste previamente registrado no Clerk (quando aplicável)

---

## 3. Dados de Teste

### 3.1 Usuário Válido (Pré-cadastrado)

| Campo    | Valor                         |
| -------- | ----------------------------- |
| E-mail   | `teste@email.com`             |
| Senha    | `Senha@123`                   |

### 3.2 Usuários Inválidos

| Cenário                      | E-mail                 | Senha            |
| ---------------------------- | ---------------------- | ---------------- |
| E-mail não cadastrado        | `inexistente@email.com` | `Qualquer@123`  |
| Senha incorreta              | `teste@email.com`       | `SenhaErrada@1` |
| Formato de e-mail inválido   | `email-invalido`       | `Senha@123`      |

---

## 4. Cenários de Teste

### TC-01 — Login com credenciais válidas (Happy Path)

**Objetivo:** Validar que um usuário com credenciais corretas consegue se autenticar e é redirecionado para a página inicial.

**Precondições:** Usuário `teste@email.com` cadastrado no Clerk.

| Passo | Ação                                                    | Resultado Esperado                                              |
| ----- | ------------------------------------------------------- | --------------------------------------------------------------- |
| 1     | Navegar para `/login`                                   | Página de login é exibida com campo de e-mail, senha e botão "Entrar" |
| 2     | Preencher campo "E-mail" com `teste@email.com`          | Campo exibe o valor digitado                                    |
| 3     | Preencher campo "Senha" com `Senha@123`                 | Campo exibe o valor mascarado                                   |
| 4     | Clicar no botão "Entrar"                                | Botão desabilita e exibe "Entrando..." durante o processamento  |
| 5     | Aguardar resposta                                       | Usuário é redirecionado para `/` (página inicial)               |
| 6     | Verificar cookie `__session`                            | Cookie `__session` está presente com `httpOnly` e `SameSite=Strict` |
| 7     | Navegar para rota protegida (ex: `/dashboard`)          | Acesso permitido (sem redirecionamento para login)              |

**Critério de sucesso:** Usuário autenticado acessa a homepage.
**Critério de falha:** Qualquer erro de validação, redirecionamento inesperado ou cookie ausente.

---

### TC-02 — Campos obrigatórios vazios (Validação client-side)

**Objetivo:** Validar que o formulário impede submissão com campos obrigatórios em branco.

**Precondições:** Nenhuma.

| Passo | Ação                                    | Resultado Esperado                                           |
| ----- | --------------------------------------- | ------------------------------------------------------------ |
| 1     | Navegar para `/login`                   | Página de login é exibida                                    |
| 2     | Deixar campo "E-mail" vazio             | Campo vazio                                                  |
| 3     | Deixar campo "Senha" vazio              | Campo vazio                                                  |
| 4     | Clicar no botão "Entrar"                | Formulário não é submetido                                   |
| 5     | Verificar mensagem de erro              | Mensagem "Email é obrigatório" exibida abaixo do campo de e-mail |
| 6     | Verificar mensagem de erro              | Mensagem "Senha é obrigatória" exibida abaixo do campo de senha |
| 7     | Verificar que não houve requisição      | Nenhuma chamada para `/api/v1/auth/sign-in` é disparada      |

**Critério de sucesso:** Erros de campo exibidos sem chamada de API.
**Critério de falha:** Submissão do formulário ocorre sem preenchimento.

---

### TC-03 — E-mail com formato inválido (Validação client-side)

**Objetivo:** Validar que o formulário rejeita e-mails fora do padrão.

**Precondições:** Nenhuma.

| Passo | Ação                                    | Resultado Esperado                                           |
| ----- | --------------------------------------- | ------------------------------------------------------------ |
| 1     | Navegar para `/login`                   | Página de login é exibida                                    |
| 2     | Preencher "E-mail" com `email-invalido` | Campo exibe o valor digitado                                 |
| 3     | Preencher "Senha" com `Senha@123`       | Campo exibe o valor mascarado                                |
| 4     | Clicar no botão "Entrar"                | Formulário não é submetido                                   |
| 5     | Verificar mensagem de erro              | Mensagem "Email inválido" exibida abaixo do campo de e-mail  |
| 6     | Verificar que não houve requisição      | Nenhuma chamada para `/api/v1/auth/sign-in` é disparada      |

**Critério de sucesso:** Erro de formato exibido sem chamada de API.
**Critério de falha:** Submissão ocorre com e-mail inválido.

---

### TC-04 — Credenciais inválidas (Erro do backend)

**Objetivo:** Validar que credenciais incorretas retornam erro 401 com mensagem apropriada.

**Precondições:** Nenhuma.

| Passo | Ação                                              | Resultado Esperado                                              |
| ----- | ------------------------------------------------- | --------------------------------------------------------------- |
| 1     | Navegar para `/login`                             | Página de login é exibida                                       |
| 2     | Preencher "E-mail" com `inexistente@email.com`    | Campo exibe o valor digitado                                    |
| 3     | Preencher "Senha" com `Qualquer@123`              | Campo exibe o valor mascarado                                   |
| 4     | Clicar no botão "Entrar"                          | Botão desabilita e exibe "Entrando..." durante o processamento  |
| 5     | Aguardar resposta                                 | Mensagem de erro do servidor exibida: "Email ou senha inválidos" |
| 6     | Verificar que cookie `__session` **não** foi criado | Nenhum cookie de sessão presente                              |
| 7     | Verificar que URL permanece `/login`              | Usuário não é redirecionado                                     |

**Critério de sucesso:** Mensagem de erro exibida, sessão não criada.
**Critério de falha:** Usuário é autenticado com credenciais inválidas.

---

### TC-05 — Senha incorreta para e-mail existente

**Objetivo:** Validar que senha errada para um e-mail cadastrado retorna erro específico.

**Precondições:** Usuário `teste@email.com` cadastrado no Clerk.

| Passo | Ação                                    | Resultado Esperado                                              |
| ----- | --------------------------------------- | --------------------------------------------------------------- |
| 1     | Navegar para `/login`                   | Página de login é exibida                                       |
| 2     | Preencher "E-mail" com `teste@email.com` | Campo exibe o valor digitado                                   |
| 3     | Preencher "Senha" com `SenhaErrada@1`   | Campo exibe o valor mascarado                                   |
| 4     | Clicar no botão "Entrar"                | Aguarda resposta                                                |
| 5     | Verificar mensagem de erro              | Mensagem "Email ou senha inválidos" exibida                     |
| 6     | Verificar que cookie `__session` **não** foi criado | Nenhum cookie de sessão presente                              |

**Critério de sucesso:** Mensagem de erro exibida sem criar sessão.
**Critério de falha:** Usuário loga com senha incorreta.

---

### TC-06 — Redirecionamento para login ao acessar rota protegida sem autenticação

**Objetivo:** Validar que um usuário não autenticado é redirecionado ao tentar acessar rotas protegidas.

**Precondições:** Navegador sem cookie `__session`.

| Passo | Ação                                    | Resultado Esperado                                           |
| ----- | --------------------------------------- | ------------------------------------------------------------ |
| 1     | Navegar diretamente para `/dashboard`   | Usuário é redirecionado para `/login`                        |
| 2     | Verificar URL                           | URL deve conter `/login`                                     |

**Critério de sucesso:** Redirecionamento ocorre sem acesso à rota protegida.
**Critério de falha:** Rota protegida é exibida sem autenticação.

---

### TC-07 — Navegação para cadastro ("Criar conta")

**Objetivo:** Validar que o link para criação de conta está presente e funcional.

**Precondições:** Nenhuma.

| Passo | Ação                                              | Resultado Esperado                           |
| ----- | ------------------------------------------------- | -------------------------------------------- |
| 1     | Navegar para `/login`                             | Página de login é exibida                    |
| 2     | Localizar link "Criar conta"                      | Link "Criar conta" visível no rodapé do form |
| 3     | Clicar em "Criar conta"                           | Usuário é redirecionado para `/signup`       |
| 4     | Verificar URL                                     | URL deve conter `/signup`                    |
| 5     | Verificar formulário de cadastro                  | Campos "Nome", "E-mail" e "Senha" visíveis   |

**Critério de sucesso:** Navegação para página de cadastro.
**Critério de falha:** Link ausente ou redirecionamento incorreto.

---

### TC-08 — Login com e-mail contendo espaços em branco (Edge case)

**Objetivo:** Validar que espaços em branco no início ou fim do e-mail são tratados.

**Precondições:** Nenhuma.

| Passo | Ação                                              | Resultado Esperado                                              |
| ----- | ------------------------------------------------- | --------------------------------------------------------------- |
| 1     | Navegar para `/login`                             | Página de login é exibida                                       |
| 2     | Preencher "E-mail" com `  teste@email.com  `      | Campo exibe o valor digitado                                    |
| 3     | Preencher "Senha" com `Senha@123`                 | Campo exibe o valor mascarado                                   |
| 4     | Clicar no botão "Entrar"                          | Dependendo da implementação: submissão com falha OU trim aplicado |
| 5     | Verificar resultado                               | Se trim: login bem-sucedido. Se não trim: erro de credenciais.  |

**Critério de sucesso:** Comportamento consistente e documentado.
**Critério de falha:** Erro inesperado (ex: crash) ou comportamento inconsistente.

---

### TC-09 — Resposta do backend segue RFC 9457 (Problem Details)

**Objetivo:** Validar que erros de autenticação retornam no formato Problem Details.

**Precondições:** Nenhuma.

| Passo | Ação                                              | Resultado Esperado                                           |
| ----- | ------------------------------------------------- | ------------------------------------------------------------ |
| 1     | Enviar requisição `POST /api/v1/auth/sign-in` com payload inválido | Resposta com `status` 401                                    |
| 2     | Verificar corpo da resposta                       | JSON contém campos: `type`, `title`, `status`, `detail`, `instance` |
| 3     | Verificar `title`                                 | `"Unauthorized"`                                             |
| 4     | Verificar `detail`                                | `"Email ou senha inválidos"`                                 |
| 5     | Verificar `status`                                | `401`                                                        |

**Critério de sucesso:** Erro segue RFC 9457.
**Critério de falha:** Formato de erro diferente do especificado.

---

### TC-10 — Logout (Encerramento de sessão)

**Objetivo:** Validar que o usuário consegue encerrar a sessão e perde acesso a rotas protegidas.

**Precondições:** Usuário `teste@email.com` autenticado.

| Passo | Ação                                    | Resultado Esperado                                           |
| ----- | --------------------------------------- | ------------------------------------------------------------ |
| 1     | Executar login bem-sucedido (TC-01)     | Usuário autenticado em `/`                                   |
| 2     | Executar ação de logout                 | Cookie `__session` removido                                  |
| 3     | Navegar para `/dashboard`               | Usuário é redirecionado para `/login`                        |
| 4     | Verificar cookie `__session`            | Cookie `__session` não está presente                         |

**Critério de sucesso:** Sessão encerrada e rotas protegidas bloqueadas.
**Critério de falha:** Usuário continua autenticado após logout.

---

## 5. Casos de Teste Adicionais (Prioridade Baixa)

| ID      | Cenário                                   | Descrição                                                     |
| ------- | ----------------------------------------- | ------------------------------------------------------------- |
| TC-11   | Múltiplas tentativas com credenciais inválidas | Verificar block/trottling após N tentativas falhas (rate limit: 100 req/min/IP) |
| TC-12   | Acesso via API sem cookie                 | `GET /v1/auth/me` sem cookie `__session` retorna 401          |
| TC-13   | Cookie expirado                           | Enviar requisição com cookie `__session` expirado retorna 401 |
| TC-14   | Login com e-mail em maiúsculas            | Verificar se e-mail `TESTE@EMAIL.COM` é aceito (case-insensitive) |

---

## 6. Critérios de Sucesso Gerais

1. Todos os cenários de TC-01 a TC-10 devem passar sem falhas.
2. Nenhum teste pode depender de estado deixado por outro teste (isolamento total).
3. O teste deve limpar cookies/sessão entre cenários (`page.context().clearCookies()`).
4. O cookie `__session` deve possuir os atributos: `httpOnly`, `SameSite=Strict`, `Secure` (em produção).

---

## 7. Responsabilidades de Auditoria e Logging

Durante a execução dos testes, deve-se verificar que:

- Tentativas de login bem-sucedidas geram log estruturado com `event: "auth.sign-in"` e `correlationId`.
- Tentativas de login com falha geram log com `level: "warn"` ou `"error"`.
- Nenhum dado sensível (senha, token) é registrado nos logs.
- Operações de login seguem o formato de auditoria quando aplicável.
