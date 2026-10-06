# Etapa 4 — Setup do Projeto

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. O projeto está configurado e pronto para desenvolvimento.

---

## O que foi feito

### 1. Pré-requisitos verificados ✅

| Ferramenta | Versão |
|-----------|--------|
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Git | 2.55.0 |
| Docker | 29.7.2 |
| Docker Compose | v5.4.0 |

### 2. Projeto NestJS criado ✅

```bash
npx @nestjs/cli new backend --package-manager npm --skip-git --strict
```

O NestJS CLI gera a estrutura base. Removemos arquivos desnecessários (`app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`).

### 3. Dependências instaladas ✅

**Produção:**
| Pacote | Para que serve |
|--------|---------------|
| `@nestjs/config` | Carregar variáveis de ambiente (.env) |
| `@nestjs/passport` | Framework de autenticação |
| `@nestjs/jwt` | Geração e validação de tokens JWT |
| `passport` / `passport-jwt` | Estratégia JWT para autenticação |
| `bcrypt` | Hash de senhas (nunca armazenamos texto puro) |
| `class-validator` | Validação de DTOs com decorators |
| `class-transformer` | Transformação de tipos nos DTOs |
| `@prisma/client` | Cliente do banco de dados (ORM) |
| `uuid` | Geração de UUIDs |

**Desenvolvimento:**
| Pacote | Para que serve |
|--------|---------------|
| `prisma` | CLI do Prisma (migrations, generate, studio) |
| `tsx` | Executa TypeScript diretamente (usado no seed) |
| `@types/*` | Tipagens TypeScript para bcrypt, passport-jwt, uuid |

### 4. Estrutura criada ✅

```
backend/
├── prisma/
│   ├── schema.prisma      ← Schema completo (15 tabelas)
│   └── seed.ts            ← Dados iniciais (36 permissões, 3 roles, 1 admin)
├── src/
│   ├── main.ts            ← Entry point (prefixo /api/v1, ValidationPipe, CORS)
│   ├── app.module.ts      ← Módulo raiz (ConfigModule + PrismaModule)
│   ├── common/
│   │   ├── dto/
│   │   │   └── pagination.dto.ts         ← DTO reutilizável de paginação
│   │   ├── interfaces/
│   │   │   └── request-with-user.interface.ts  ← Interface do request autenticado
│   │   └── utils/
│   │       └── cpf-cnpj.util.ts          ← Validação/formatação CPF e CNPJ
│   └── modules/
│       └── prisma/
│           ├── prisma.module.ts   ← Módulo global do Prisma
│           └── prisma.service.ts  ← PrismaClient como service injetável
├── .env                   ← Variáveis de ambiente (dev)
├── .env.example           ← Template (vai pro git)
└── package.json           ← Scripts + prisma seed config
```

### 5. Configurações ✅

**Scripts adicionados ao package.json:**
```bash
npm run db:migrate    # Rodar migrations
npm run db:seed       # Popular o banco com dados iniciais
npm run db:reset      # Reset completo (cuidado!)
npm run db:studio     # Abrir o Prisma Studio (UI do banco)
```

**Docker Compose:**
- PostgreSQL 16 Alpine na porta 5432
- Volume persistente para os dados
- Healthcheck configurado

---

## O que falta para rodar

### Passo 1: Abrir o Docker Desktop
O PostgreSQL roda dentro do Docker. Abra o Docker Desktop e aguarde ele iniciar.

### Passo 2: Subir o banco
```bash
docker compose up -d
```

### Passo 3: Rodar a primeira migration
```bash
cd backend
npm run db:migrate
```
Isso cria todas as 15 tabelas no banco.

### Passo 4: Popular com dados iniciais
```bash
npm run db:seed
```
Isso cria: 36 permissões, organização de exemplo, 3 roles (ADMIN, FINANCEIRO, OPERACIONAL), e o usuário admin.

### Passo 5: Rodar a aplicação
```bash
npm run start:dev
```
A API estará em `http://localhost:3000/api/v1`

---

## Conceitos que você aprendeu nesta etapa

| Conceito | O que é |
|----------|---------|
| **NestJS CLI** | Ferramenta que gera o projeto com estrutura pronta |
| **Módulo Global** | `@Global()` — disponível em todos os módulos sem importar |
| **ValidationPipe** | Middleware que valida automaticamente os DTOs de entrada |
| **whitelist: true** | Remove campos que não estão definidos no DTO (segurança) |
| **forbidNonWhitelisted** | Retorna erro se o cliente enviar campos não esperados |
| **transform: true** | Converte tipos automaticamente (string da URL → number) |
| **Prisma generate** | Gera o client TypeScript a partir do schema.prisma |
| **Prisma migrate** | Cria/altera tabelas no banco baseado nas mudanças do schema |
| **Seed** | Script que popula o banco com dados iniciais necessários |
| **upsert** | "Create or update" — cria se não existe, ignora se já existe |
| **Docker Compose** | Orquestra containers (por enquanto só o PostgreSQL) |
| **.env** | Variáveis de ambiente — senhas, secrets, configs que mudam por ambiente |

---

## Próximo passo

**Etapa 5: Módulo de Autenticação (Auth)** — Login, JWT, refresh token, guards de autenticação.

