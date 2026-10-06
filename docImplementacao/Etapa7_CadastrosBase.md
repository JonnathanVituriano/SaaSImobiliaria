# Etapa 7 — Gestão de Cadastros (CRUDs Básicos)

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. A fundação de dados de Imóveis, Proprietários e Inquilinos foi criada.

---

## O que foi feito

Para acelerar o desenvolvimento, criei um script gerador (`generate-cruds.js`) que construiu de forma padronizada três módulos inteiros do NestJS: **Owners** (Proprietários), **Properties** (Imóveis) e **Tenants** (Inquilinos).

### 1. DTOs de Validação 🛡️
Foram gerados os `CreateDto` e `UpdateDto` para as três entidades, utilizando o `@nestjs/mapped-types` e os decorators do `class-validator`:
- **Owners**: Validação de e-mail, chaves PIX e `cpfCnpj`.
- **Properties**: Validação de endereço completo, área em m², número de quartos e `ownerId` (vínculo com o proprietário).
- **Tenants**: Validação de `whatsapp` obrigatório (crucial para o nosso robô de cobrança!) e `cpf`.

### 2. Controladores (Controllers) 🚦
- Foram criadas as 5 rotas padrão do REST: `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.
- Todas as rotas estão **bloqueadas pelo `@RequirePermissions(...)`**. Por exemplo, só quem tem a permissão `properties.update` pode enviar um PATCH para a rota de imóveis.

### 3. Serviços (Services) ⚙️
- **Isolamento de Imobiliária (Multi-tenant)**: Os serviços usam o `this.prisma.extended`. Se um atendente tentar listar os imóveis (`findAll`), o Prisma vai automaticamente listar **apenas os imóveis daquela imobiliária** injetando o `where: { organizationId: '...' }` (que configuramos na Etapa 6).
- **Paginação Inclusa**: O `findAll` de todos os 3 módulos já está usando nosso `PaginationDto` com limites de segurança e retorno do `meta.totalPages` nativamente!
- **Soft Delete**: A rota de deleção faz um `update { isActive: false }` invés de apagar fisicamente o registro do banco de dados (o que daria erro de relacionamento futuro em cobranças).

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **Mapped Types (PartialType)** | Biblioteca oficial do NestJS. O `UpdateDto` herda tudo do `CreateDto`, mas torna todos os campos opcionais (permitindo alterar só o nome, sem precisar mandar a data de nascimento, por exemplo). |
| **Promise.all na Paginação** | No `findAll`, disparamos `findMany` e `count` juntos (em paralelo). Isso corta o tempo de espera do banco de dados pela metade. |
| **Soft Delete** | Nunca usamos `DELETE FROM` em SaaS de gestão. Se apagarmos um Inquilino do banco, o histórico financeiro dele "quebra". Em vez disso, mudamos a flag `isActive` para `false`. |

---

## Próximo passo

**Etapa 8: Módulo de Contratos de Locação.** — Vamos criar a lógica que "amarra" um Inquilino, um Proprietário e um Imóvel através de um Contrato (que terá valor de aluguel e data de vencimento).

