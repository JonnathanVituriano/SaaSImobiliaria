# Etapa 9 — Engine de Cobranças (Módulo Financeiro)

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. O motor financeiro que dá vida ao SaaS de cobranças foi estabelecido. Faturas são geradas e multas são calculadas automaticamente.

---

## O que foi feito

### 1. Geração de Faturas Automatizada (`BillingCron`) 🔄
Utilizando o `@nestjs/schedule`, criei um serviço em background que roda **todos os dias à 1h da manhã**. O que ele faz:
- Varre toda a base de dados buscando contratos que estão com o status `active` (ativos).
- Verifica se já existe um boleto (`Billing`) gerado para aquele contrato naquele mês.
- Se não existir, ele gera automaticamente a fatura com o valor (`rentAmount`) definido no contrato, marcando o vencimento pro `dueDay` estabelecido.

### 2. Cálculo de Multas e Juros Dinâmico 📈
- O Cron Job varre também as faturas que estão vencidas (onde hoje > `dueDate`) e cujo status não seja `paid`.
- Ele busca as configurações **daquela imobiliária específica** (`OrganizationSettings.gracePeriodDays`, `penaltyPercentage`, `interestPercentage`).
- Verifica a **carência**. Se passou a carência, ele calcula a multa fixa e aplica os juros *pro rata die* (por dia de atraso) e salva no banco (`totalAmount`).
- Isso garante que a imobiliária só puna o atraso conforme a política dela mesma!

### 3. Registro de Pagamentos (`RegisterPayment`) 💸
- Um método (acessível pela API via `POST`) para que a equipe financeira da imobiliária registre que o boleto ou PIX foi pago.
- Recebe o valor e o método.
- Atualiza o `status` da cobrança. Se o valor pago for menor que o valor total da fatura (com multas), o status fica `partially_paid`. Se atingir o total, fica `paid` (PAGO).

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **CRON Jobs em Monolitos** | No NestJS, rodar tarefas recorrentes é simples com o decorador `@Cron()`. No futuro (quando a aplicação escalar muito), separaríamos isso em um microsserviço à parte (Worker) ou usaríamos filas como o `Redis + BullMQ`, mas para o MVP, rodar dentro do próprio backend economiza infraestrutura. |
| **Bypass do Tenant Context** | Lembra do nosso Interceptor de Isolamento? Como o CRON roda em *background* sem um "usuário" fazendo a requisição web, ele não passa pelo Interceptor. Portanto, dentro do CRON, nós usamos a instância do `Prisma` nativa e não a `.extended`. Lá, nós mesmos fornecemos o `organizationId` em cada criação! |

---

## Próximo passo

**Etapa 10: Inadimplência e Régua de Cobrança (Collections).** — A magia do SaaS! É aqui que o sistema começa a enviar os "lembretes de atraso" no WhatsApp.

