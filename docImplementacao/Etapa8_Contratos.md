# Etapa 8 — Módulo de Contratos de Locação

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. Agora o sistema suporta vincular Inquilino, Proprietário e Imóvel com regras de negócio claras.

---

## O que foi feito

### 1. DTOs de Contrato ✅
- `propertyId`, `tenantId`, `ownerId`: As chaves (UUIDs) essenciais para a vinculação.
- `rentAmount`: Valor do aluguel (`number`).
- `dueDay`: Dia de vencimento (`1` a `31`). Validado via `@Min(1)` e `@Max(31)`.
- `startDate` / `endDate`: Definem a vigência. Recebidas como formato ISO8601 de string e validadas pelo `class-validator`.

### 2. Lógica de Status do Imóvel ✅
No `ContractsService`, aplicamos as primeiras regras de negócio de fato interdependentes:
- **Ao criar (Create)**:
  - O sistema busca o Imóvel.
  - Verifica se o `status` do imóvel é `available` (disponível). Se for `rented` ou `maintenance`, ele bloqueia (retorna Erro `400 Bad Request`).
  - Cria o Contrato.
  - Altera o status do Imóvel para `rented`.
- **Ao encerrar (Terminate)**:
  - Troquei o método clássico `remove` por `terminate`.
  - O status do contrato muda para `terminated`.
  - O status do imóvel vinculado muda de volta para `available`, permitindo ser alugado novamente por outro inquilino.

### 3. Includes Ricos (Prisma) ✅
- Na listagem de contratos (`findAll`), não estamos retornando apenas um monte de IDs (UUIDs puros).
- O Prisma faz as subqueries (`include: { tenant: { select: ... } }`) automaticamente para enviar também o `Nome do Inquilino` e o `Endereço do Imóvel`, facilitando enormemente a vida de quem estiver fazendo o Frontend (React) depois.

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **Mudança de Estado Interdependente** | Quando alteramos uma tabela (`Contract`), precisamos obrigatoriamente refletir a alteração em outra (`Property`). Se precisarmos garantir que ambos aconteçam ou nenhum aconteça (caso dê erro no meio), usaríamos Transações (`$transaction`). |
| **Datas em API REST** | Normalmente APIs recebem datas em formato `String ISO 8601` (Ex: `2026-10-01T00:00:00Z`). O DTO valida isso com `@IsDateString()`, e dentro do nosso Service nós convertemos com `new Date()` antes de mandar para o banco via Prisma. |

---

## Próximo passo

**Etapa 9: Engine de Cobranças (Módulo Financeiro).** — A coisa começa a ficar muito legal agora. É onde vamos gerar os boletos (Billings) automaticamente baseados no `dueDay` e no `rentAmount` definidos aqui nos contratos!

