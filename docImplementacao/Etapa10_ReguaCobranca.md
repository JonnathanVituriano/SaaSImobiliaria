# Etapa 10 — Régua de Cobranças (Inadimplência)

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. A automação das mensagens baseadas nos atrasos das faturas foi estabelecida, conectando os Modos de Cobrança (Desativado, Supervisionado, Autônomo).

---

## O que foi feito

### 1. Sistema de Templates (`CollectionTemplate`) 📝
Permite que o usuário crie mensagens de WhatsApp customizadas e dinâmicas utilizando *placeholders* como `{{nome}}`, `{{valor}}` e `{{imovel}}`. 
Cada template é configurado com um range de dias de atraso (`daysOverdueMin` e `daysOverdueMax`), o que permite ter mensagens do tipo:
- Fatura que vai vencer amanhã (-1 dias).
- Fatura que venceu ontem (1 dia).
- Fatura com aviso final de corte/negativação (30 dias).

### 2. Caixa de Saída e Aprovação (`CollectionMessage`) 📤
As mensagens não são jogadas direto pro WhatsApp. Elas primeiro caem na tabela `CollectionMessage`.
- Aqui que a Mágica do Jonnathan acontece: Se a `OrganizationSettings.collectionMode` for **2 (Supervisionado)**, as mensagens caem com o status `pending_approval`.
- Para isso criei a rota `POST /collections/messages/:id/approve` (`@RequirePermissions('collections.send')`). Somente funcionários autorizados apertam esse botão, o que muda a mensagem de `pending_approval` para `pending` (liberada para envio real).

### 3. O Robô da Régua (`CollectionsCron`) 🤖
- Um agendamento rodando **todos os dias às 9h da manhã**.
- Varre as faturas pendentes ou atrasadas de TODAS as imobiliárias cadastradas.
- Verifica o `collectionMode`. Se for **1 (Desativado)**, pula.
- Calcula quantos dias a fatura tem de atraso e encontra qual é o Template ideal para aquela imobiliária usar hoje.
- Checa para não gerar mensagens duplicadas para o mesmo template e fatura.
- Gera o texto final já substituindo os dados do Inquilino, Imóvel e Valor Atualizado (com multa já calculada lá na Etapa 9).

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **Range Queries** | Quando usamos no Prisma `gte: diffDays` (maior ou igual) e `lte: diffDays` (menor ou igual), conseguimos montar a estrutura "Se estiver entre o dia 10 e 15". |
| **Templates e Placeholders** | Uma técnica simples e antiga (tipo o Mailchimp). Salvamos no banco o padrão `{{variavel}}`. No lado do Backend (Controller/Cron), fazemos o replace dessa String pelas informações vindas do banco de dados relacional. |

---

## Próximo passo

**Etapa 11: Integração WhatsApp (A Entrega).** — Chegamos ao ápice. Na etapa 11 iremos conectar nosso banco com a API Cloud do Meta (WhatsApp), criando um CRON que pega essas mensagens que estão `pending` e as despacha para o celular do Inquilino.

