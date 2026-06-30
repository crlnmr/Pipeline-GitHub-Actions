# Especificação Funcional

## Requisitos

### RF-01 Vitrine de Produtos

- Permite ao cliente visualizar os produtos disponíveis em uma vitrine digital organizada em formato de catálogo.
- Exibe informações básicas dos produtos, como nome, descrição, preço e imagem, possibilitando a seleção de itens para compra.

#### Regras de negócio

- Produtos inativos não devem aparecer na vitrine.
- Produtos sem estoque podem ser visualizados, mas não podem ser adicionados ao carrinho.

### RF-02 Criação e Acompanhamento de Pedidos

- Permite ao cliente criar pedidos a partir da seleção de produtos e respectivas quantidades.
- Permite ao cliente visualizar o histórico de pedidos.
- Possibilita calcular automaticamente o valor total e informar dados básicos do cliente.
- Permite cancelar pedidos ainda não pagos.

#### Regras de negócio

- O sistema deve recalcular automaticamente o valor total do pedido sempre que a quantidade de um item for alterada
- Um pedido só pode ser confirmado se possuir pelo menos um produto selecionado
- Não permitir inclusão de quantidade superior ao estoque disponível
- Estoque deve ser validado novamente na confirmação do pedido
- Produtos inativos não podem ser vendidos.
- Pedidos cancelados não podem retornar ao fluxo operacional.
- Apenas administradores podem registrar pagamentos.
- O valor total do pedido é calculado pela soma dos itens.
- O cliente deve estar autenticado para criar pedidos.


#### Estados e transições dos pedidos

| Estado Atual             | Próximo Estado |
| ------------------------ | -------------- |
| Novo                     | Pago           |
| Pago                     | Preparação     |
| Preparação               | Faturado       |
| Faturado                 | Despachado     |
| Despachado               | Entregue       |
| Qualquer exceto Entregue | Cancelado      |

Novo = pedido criado aguardando pagamento


### RF-03 Gestão de Categorias

- Permite ao administrador cadastrar, editar, remover e organizar categorias.

#### Regras de negócio

- Apenas administradores podem criar, editar ou remover categorias

### RF-04 Gestão de Produtos

- Permite ao administrador cadastrar, editar, remover e organizar produtos.
- Controla a visibilidade dos produtos na vitrine digital.

#### Regras de negócio

- Apenas usuários administradores podem criar, editar ou remover produtos
- Produtos marcados como inativos não devem ser exibidos na vitrine

### RF-05 Gestão de Clientes

- Permite ao administrador manter o cadastro de clientes.
- Possibilita criar, consultar, atualizar e excluir registros de clientes associados aos pedidos.

#### Regras de negócio

- O sistema deve permitir associar um cliente existente a um novo pedido
- Clientes com pedidos associados não devem ser excluídos, apenas desativados
- Alterações nos dados do cliente devem ser refletidas nos pedidos futuros
- Clientes com pedidos associados não podem ser removidos.

### RF-06 Gestão de Pedidos

- Permite ao administrador visualizar e acompanhar os pedidos por status.
- Possibilita identificar pedidos pendentes ou atrasados e movimentá-los entre os estados do fluxo.
- Permite ao administrador registrar e controlar os pagamentos associados aos pedidos.
- O registro de pagamento será manualmente realizado pelo administrador.
- O método de pagamento deve ser informado no momento do registro manual do pagamento.

#### Regras de negócio
- Toda alteração de status deve ser auditada.
- O administrador deve conseguir filtrar pedidos por status
- A mudança de status de um pedido deve ser registrada e refletida imediatamente
- Apenas administradores podem registrar pagamentos.
- Um pagamento pertence a exatamente um pedido.
- O pedido é considerado pago quando existir pagamento com status Confirmado.

### RF-07 Dashboard

- Permite ao administrador acompanhar o desempenho das vendas por meio de um dashboard.
- Apresenta vendas totais, valores recebidos e pendentes e filtros por período.

#### Regras de negócio

- O dashboard deve exibir corretamente os valores totais recebidos e pendentes para o período selecionado
- A aplicação de filtros por período deve atualizar os indicadores exibidos
- Os dados apresentados no dashboard devem refletir apenas pedidos registrados no sistema

---

## Entidades

### Categoria

- Descrição
  - Agrupa produtos para organização e navegação da vitrine.
- Atributos
  - Nome
  - Ativo

### Produto

- Descrição
  - Item comercializado na plataforma e exibido na vitrine digital.
- Atributos
  - Nome
  - Categoria
  - Imagem
  - Descrição
  - Preço
  - Estoque
  - Ativo
 
### Cliente

- Descrição
  - Pessoa responsável pela realização de pedidos.
- Atributos
  - Nome
  - Endereço
  - E-mail
  - Telefone
  - Ativo

## Pedido

- Descrição
  - Representa uma compra realizada por um cliente.
- Atributos
  - Número
  - Cliente
  - Endereço de Entrega
  - Status
  - Valor Total (calculado pela soma dos itens no momento da confirmação. Não persistido)
  
### Item de Pedido

- Descrição
  - Item associado a um pedido.
- Atributos
  - Pedido
  - Produto
  - Preço Unitário
  - Quantidade

### Pagamento

Descrição

- Representa um registro financeiro associado a um pedido.

Atributos

- Pedido
- Valor
- Método
- Data
- Status
- Observação

---

## Interfaces gráficas

### Página Principal

- Campos
  - Busca de produtos
- Comandos
  - Adicionar ao carrinho
  - Navegação para funcionalidades do sistema

#### Listagem de Categorias

- Campos
  - Nome da categoria
  - Ativo
- Comandos
  - Cadastrar
  - Pesquisar
  - Editar
  - Excluir

### Listagem de Produtos

- Campos
  - Nome
  - Imagem
  - Descrição
  - Preço
  - Estoque
  - Categoria
  - Ativo
- Comandos
  - Cadastrar
  - Pesquisar
  - Editar
  - Excluir

#### Edição de Produto

- Campos
  - Nome
  - Imagem
  - Descrição
  - Preço
  - Estoque
  - Categoria
  - Ativo
- Comandos
  - Salvar
  - Cancelar

### Login

- Campos
  - E-mail
  - Senha
- Comandos
  - Entrar
  - Criar conta

#### Carrinho de Compras

- Campos
  - Quantidade dos itens
- Comandos
  - Confirmar pedido
  - Excluir item

#### Acompanhamento de Pedidos

- Campos
  - Filtros de consulta
- Comandos
  - Detalhar pedido

#### Detalhe do Pedido

- Campos
  - Número
  - Status
  - Produtos
- Comandos
  - Alterar status

#### Listagem de Clientes

- Campos
  - Nome
  - Endereço
  - E-mail
  - Telefone
- Comandos
  - Cadastrar
  - Pesquisar
  - Editar
  - Excluir

#### Edição de Cliente

- Campos
  - Nome
  - Endereço
  - E-mail
  - Telefone
- Comandos
  - Salvar
  - Cancelar

### Gestão de Pedidos

- Campos
  - Filtros por status
- Comandos
  - Atualizar status
  - Detalhar pedido

#### Dashboard

- Campos
  - Vendas Totais: Soma dos pedidos não cancelados no período selecionado, tendo como padrão os últimos 30 dias.
  - Recebido: Soma dos pagamentos registrados no período selecionado, tendo como padrão os últimos 30 dias.
  - Pendente: Valor dos pedidos sem pagamento registrado no período selecionado, tendo como padrão os últimos 30 dias.
  - Filtro de período.
- Comandos
  - Aplicar filtro
  
 
