# Definição de Requisitos do Produto (PRD)

## Descrição do produto

O **Problema** A falta de controle em pedidos e pagamentos gera prejuízos diários para o microempreendedor.

A **Solução** O DevAI resolve isso com uma plataforma de fluxo duplo:

Para o **Cliente** Uma vitrine digital simples para realizar pedidos.

Para o **Empreendedor** Um painel de gestão completo, do pedido ao pagamento.

Nossos Diferenciais:

- **Simplicidade Radical** Adoção imediata e zero complexidade técnica.
- **Vitrine Profissional** Credibilidade instantânea para o catálogo de produtos.
- **Controle Financeiro** Fim da inadimplência e das perdas por esquecimento.

---

## Perfis de Usuário

### Administrador

- Problemas: o empreendedor sofre com perdas de vendas e sobrecarga por processo manual.
- Objetivos: realizar a gestão de vendas, por meio do fluxo de pedidos e pagamentos, além da manutenção de dados sobre produtos e clientes.
- Dados demográficos: faixa etária típica entre 18 e 60.
- Motivações: possibilitar ao cliente uma experiência única.
- Frustrações: falta de tempo para dedicar aos produtos.

### Cliente

- Problemas: dificuldade em pesquisar produtos.
- Objetivos: realizar pedidos de maneira simples e transparente.
- Dados demográficos: faixa etária típica entre 18 e 60.
- Motivações: ter informações para tomar boas decisões de compra.
- Frustrações: excesso de informalidade no atendimento.

---

## Funcionalidades

RF-01 Vitrine de Produtos
RF-02 Criação e Acompanhamento de Pedidos
RF-03 Gestão de Categorias
RF-04 Gestão de Produtos
RF-05 Gestão de Clientes
RF-06 Gestão de Pedidos
RF-07 Dashboard

## Requisitos não funcionais

RNF-01 Segurança
RNF-02 Auditoria
RNF-03 Observabilidade
RNF-04 Escalabilidade
RNF-05 Portabilidade
RNF-06 Testabilidade

## Métricas de Sucesso

- Aumentar em 20% o Total recebido (R$) em 12 meses.
- Reduzir em 10% o Total pendente (R$) em 12 meses.

---

## Premissas e restrições

- O prazo de entrega do MVP é de um mês.
- O prazo de entrega da versão 1.0 é de seis meses.
- A stack tecnológica será definida em documento específico.

## Escopo

### MVP

- Não existe tenant_id
- Não existe abstração de tenancy
- Nenhum artefato de tenancy deve ser criado


### Versões futuras

- Multi-tenancy
- Gateway de pagamento
- WhatsApp
- E-mail transacional
- Aplicativo mobile
- Relatórios PDF
- Relatórios Excel
- Banco compartilhado
- Schema compartilhado
- Conversas ou chat com clientes
- Divisão de pagamento
- Controle avançado de estoque (movimentações automáticas, alertas, histórico)
- CRM avançado de clientes
- Integração automática com gateways de pagamento


