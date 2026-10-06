# Etapa 6 — Multi-tenancy Automático e Permissões (RBAC)

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. A base de dados agora suporta isolamento automático de clientes (imobiliárias) e regras de negócio granulares por papel (Role).

---

## O que foi feito

### 1. Isolamento Multi-tenant (Row-Level Security) ✅
Para que um único banco de dados abrigue várias imobiliárias sem riscos, implementamos a dupla **AsyncLocalStorage + Prisma Client Extensions**:
- `TenantContext`: Um espaço de memória assíncrono que retém dados pelo ciclo de vida completo de uma requisição HTTP.
- `TenantInterceptor`: Injetado globalmente via `app.module.ts`. Quando o `JwtAuthGuard` reconhece o usuário, este interceptor salva a `organizationId` dele no `TenantContext`.
- `PrismaService`: Substituímos o Prisma puro por uma versão estendida (`this.prisma.extended`). A extensão lê o `TenantContext` de forma invisível. Em rotas que criam (`create`, `createMany`) ou buscam/alteram (`findMany`, `update`, `delete`), o `organizationId` é injetado. Se não injetarmos e formos tentar criar um imóvel, ele salva pra nossa Imobiliária sozinho. Se formos apagar "todos os inquilinos", ele apaga só os "nossos" inquilinos!

### 2. Proteção de Acesso Granular (Role-Based Access Control) ✅
- `@RequirePermissions(...)`: Decorator para marcar exatamente o que uma rota faz (Ex: `billing.manage`).
- `PermissionsGuard`: Guard global. Sempre que alguém acessar uma rota, ele cruza as permissões injetadas no JWT (no login) com as permissões requeridas pelo Decorator. Se o usuário for ADMIN (tem todas), passa direto. Se for corretor tentando apagar cobrança, recebe erro `403 Forbidden`.
- Ambos os Guards e o Interceptor estão amarrados no `APP_GUARD` e `APP_INTERCEPTOR` no `app.module.ts`, garantindo que não deixemos "passar batido".

---

## Novos Conceitos 

| Conceito | Explicação |
|----------|---------|
| **AsyncLocalStorage (ALS)** | No Node.js não existe "memória por Thread" igual Java/C#, tudo é o mesmo processo. O ALS ajuda a criar uma "bolha" de variáveis que sobrevive enquanto uma Promessa assíncrona estiver viva, ideal pra salvar dados da Request (como orgId). |
| **Prisma Client Extensions** | Recurso moderno do Prisma que nos deixa ouvir ou modificar operações nativas de banco antes que elas ocorram, perfeito para políticas rigorosas (Row-Level Security, Soft Deletes, Auditoria). |

---

## Próximo passo

**Etapa 7: Gestão de Inquilinos, Imóveis e Proprietários (CRUDs).** — É a hora de botarmos a mão na massa! Criar as rotas de criação, listagem, edição e deleção de Imóveis, Proprietários e Inquilinos, conectadas à Imobiliária.

