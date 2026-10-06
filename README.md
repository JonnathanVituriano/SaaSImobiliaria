<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<h1 align="center">🏢 ImobSaaS</h1>

<p align="center">
  <strong>Plataforma SaaS completa para gestão de imobiliárias</strong><br/>
  Multi-tenant · Cobranças Automáticas · Integração WhatsApp · Dark Mode
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-como-rodar">Como Rodar</a> •
  <a href="#-deploy">Deploy</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a>
</p>

---

## 📋 Sobre o Projeto

O **ImobSaaS** é uma plataforma completa de gestão imobiliária projetada para atender **múltiplas imobiliárias** em uma única instalação (multi-tenant). Cada imobiliária tem seus dados completamente isolados, com seu próprio cadastro de proprietários, imóveis, inquilinos, contratos e cobranças.

O sistema automatiza o ciclo completo de locação:

```
Proprietário cadastra imóvel → Inquilino assina contrato → Sistema gera faturas mensais
→ Robô de cobrança envia lembretes via WhatsApp → Pagamento registrado → Dashboard atualizado
```

---

## ✨ Funcionalidades

### 🔐 Autenticação & Segurança
- Login com **JWT** (Access Token + Refresh Token)
- Refresh token silencioso (o usuário nunca é deslogado abruptamente)
- **RBAC** (Role-Based Access Control) com permissões granulares
- Proteção contra brute force (rate limiting por IP)
- Senhas hasheadas com bcrypt (12 salt rounds)

### 🏗️ Multi-Tenancy
- Isolamento completo de dados entre imobiliárias
- Implementado via **Prisma Client Extensions** com `AsyncLocalStorage`
- Interceptação automática em queries de leitura, escrita e agregação
- Modelos globais (Organization, Permissions) excluídos da interceptação

### 🏠 Cadastros Base
| Módulo | Funcionalidades |
|--------|----------------|
| **Proprietários** | CRUD completo, máscara CPF/CNPJ inteligente, chave PIX |
| **Imóveis** | Tipos (Casa, Apto, Comercial, Terreno), vínculo com proprietário, status automático |
| **Inquilinos** | CRUD com máscara CPF e telefone, validação de email |
| **Contratos** | Vincula imóvel + inquilino + proprietário, define aluguel e dia de vencimento |

### 💰 Motor Financeiro
- **Geração automática de faturas** via CRON diário (1h da manhã)
- Cálculo automático de **multa** (% fixa) e **juros** (proporcional ao dia)
- Período de carência configurável por imobiliária
- Registro de pagamentos (total ou parcial)
- Status: `pending` → `overdue` → `partially_paid` → `paid`

### 📱 Régua de Cobranças + WhatsApp
- **3 modos de operação:**
  - 🔴 **Desativado** — Imobiliária faz tudo manualmente
  - 🟡 **Supervisionado** — Robô gera mensagens, humano aprova antes do envio
  - 🟢 **Autônomo** — Robô gera e envia automaticamente
- Templates personalizáveis com placeholders (`{{nome}}`, `{{valor}}`, `{{imovel}}`)
- Integração com **Meta Graph API** (WhatsApp Business)
- Controle de deduplicação (não envia a mesma mensagem duas vezes)

### 📊 Dashboard
- Receita prevista vs. recebida do mês
- Total de inadimplência (valor + quantidade)
- Contadores operacionais (imóveis, contratos, inquilinos)
- Últimos pagamentos recebidos em tempo real

### 🎨 Frontend
- **Next.js 16** com App Router e Turbopack
- Tema **azul gradiente** com dark mode completo
- Sidebar azul escuro elegante com gradiente
- Menu mobile responsivo (hamburger + drawer)
- Busca funcional em todas as listagens
- Botões de Editar funcionais (modais pre-preenchidos)
- Máscaras de CPF, CNPJ e telefone nos formulários
- Fonte Inter para melhor legibilidade

---

## 🏛️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                │
│              Porta 80/443 — SSL Let's Encrypt            │
├──────────────────────┬──────────────────────────────────┤
│                      │                                    │
│   /api/*             │   /*                               │
│   ▼                  │   ▼                                │
│ ┌──────────────┐     │ ┌──────────────┐                  │
│ │   Backend    │     │ │   Frontend   │                  │
│ │   NestJS     │     │ │   Next.js    │                  │
│ │   :3001      │     │ │   :3000      │                  │
│ └──────┬───────┘     │ └──────────────┘                  │
│        │             │                                    │
│        ▼             │                                    │
│ ┌──────────────┐     │                                    │
│ │  PostgreSQL  │     │                                    │
│ │    :5432     │     │                                    │
│ └──────────────┘     │                                    │
└──────────────────────┴──────────────────────────────────┘
```

### Fluxo de Multi-Tenancy

```
Request HTTP → JWT Guard (valida token)
            → Tenant Interceptor (extrai organizationId do JWT)
            → AsyncLocalStorage.run(orgId, () => ...)
            → Prisma Extension intercepta queries automaticamente
            → WHERE organizationId = :orgId injetado em TODAS as queries
```

---

## 🛠️ Tech Stack

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 22 LTS | Runtime |
| NestJS | 11.x | Framework HTTP |
| Prisma | 6.x | ORM + Migrations |
| PostgreSQL | 16 | Banco de dados |
| JWT (jsonwebtoken) | — | Autenticação |
| bcrypt | — | Hash de senhas |
| @nestjs/schedule | — | CRON Jobs |
| class-validator | — | Validação de DTOs |
| axios | — | Chamadas à API do WhatsApp |

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 16.3 | Framework React (App Router) |
| React | 19 | UI Library |
| Tailwind CSS | 4.x | Estilização |
| shadcn/ui | — | Componentes base |
| next-themes | — | Dark/Light mode |
| axios | — | Chamadas HTTP |
| js-cookie | — | Gerenciamento de cookies |
| lucide-react | — | Ícones |

### Infraestrutura
| Tecnologia | Uso |
|-----------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração |
| Nginx | Reverse Proxy + SSL |
| Let's Encrypt | Certificado HTTPS gratuito |

---

## 🚀 Como Rodar

### Pré-requisitos
- [Node.js 22+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/) (ou Docker)
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/JonnathanVituriano/SaaSImobiliaria.git
cd SaaSImobiliaria
```

### 2. Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações (DATABASE_URL, JWT_SECRET, etc.)

# Rode as migrations
npx prisma migrate deploy

# Popule o banco com dados iniciais (admin + permissões)
npx prisma db seed

# Inicie o servidor
npm run start:dev
```

O backend estará rodando em `http://localhost:3001/api/v1`

### 3. Configure o Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 4. Acesse o sistema

- **URL:** http://localhost:3000/login
- **Email:** `admin@saasimobiliaria.com`
- **Senha:** `Admin@123456`

---

## 🐳 Rodar com Docker

Se preferir rodar tudo com Docker (recomendado para produção):

```bash
# Na raiz do projeto
cp .env.production.example .env

# Edite o .env com suas configurações
nano .env  # ou notepad .env no Windows

# Suba todos os serviços
docker compose up -d --build

# Rode as migrations e o seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Acesse `http://localhost` no navegador.

---

## 🌐 Deploy

### Opção 1: VPS (Oracle Cloud, DigitalOcean, etc.)

```bash
# Na VPS, execute o script de setup
sudo bash setup-vps.sh

# Clone o projeto, configure o .env e suba com Docker
docker compose up -d --build
```

### Opção 2: Serviços Gerenciados (Gratuito)

| Serviço | Componente | Custo |
|---------|-----------|-------|
| [Vercel](https://vercel.com) | Frontend (Next.js) | Grátis |
| [Render](https://render.com) | Backend (NestJS) | Grátis |
| [Neon](https://neon.tech) | PostgreSQL | Grátis |

---

## 📁 Estrutura do Projeto

```
SaaSImobiliaria/
├── backend/                      # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma         # Schema do banco de dados
│   │   ├── migrations/           # Histórico de migrations
│   │   └── seed.ts               # Dados iniciais (admin, roles, permissões)
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/       # @CurrentUser, @Public, @RequirePermissions
│   │   │   ├── guards/           # JwtAuthGuard, PermissionsGuard
│   │   │   ├── interceptors/     # TenantInterceptor (multi-tenancy)
│   │   │   └── tenant/           # AsyncLocalStorage context
│   │   ├── modules/
│   │   │   ├── auth/             # Login, JWT, Refresh Token
│   │   │   ├── billing/          # Faturas, Pagamentos, CRON
│   │   │   ├── collections/      # Régua de cobranças, Templates, CRON
│   │   │   ├── contracts/        # Contratos de locação
│   │   │   ├── dashboard/        # Agregações financeiras
│   │   │   ├── owners/           # Proprietários
│   │   │   ├── prisma/           # PrismaService + Extensions
│   │   │   ├── properties/       # Imóveis
│   │   │   ├── tenants/          # Inquilinos
│   │   │   └── whatsapp/         # Integração Meta Graph API
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                     # Next.js 16
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Tela de login
│   │   │   ├── app/              # Área autenticada
│   │   │   │   ├── dashboard/    # Painel principal
│   │   │   │   ├── properties/   # Gestão de imóveis
│   │   │   │   ├── tenants/      # Gestão de inquilinos
│   │   │   │   ├── owners/       # Gestão de proprietários
│   │   │   │   ├── contracts/    # Gestão de contratos
│   │   │   │   ├── billings/     # Faturas e pagamentos
│   │   │   │   ├── collections/  # Régua de cobranças
│   │   │   │   ├── settings/     # Configurações
│   │   │   │   └── layout.tsx    # Layout com sidebar
│   │   │   ├── globals.css       # Tema (cores, dark mode)
│   │   │   └── layout.tsx        # Root layout
│   │   ├── lib/
│   │   │   └── api.ts            # Axios + interceptor JWT
│   │   └── middleware.ts         # Proteção de rotas
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                        # Configuração do reverse proxy
├── docImplementacao/             # Documentação das 12 etapas de desenvolvimento
├── docker-compose.yml            # Orquestração de todos os serviços
├── setup-vps.sh                  # Script de setup para VPS
└── .env.production.example       # Template de variáveis de ambiente
```

---

## 📖 Documentação

O diretório `docImplementacao/` contém a documentação completa de cada etapa do desenvolvimento:

| Etapa | Documento | Conteúdo |
|-------|----------|----------|
| 1 | Análise do Produto | Estudo de mercado e definição do escopo |
| 2 | Requisitos | Requisitos funcionais e não-funcionais |
| 3 | Arquitetura | Decisões técnicas e diagramas |
| 4 | Setup do Projeto | Configuração inicial do monorepo |
| 5 | Autenticação | JWT, RBAC, Guards |
| 6 | Multi-Tenancy | Prisma Extensions, AsyncLocalStorage |
| 7 | Cadastros Base | Proprietários, Imóveis, Inquilinos |
| 8 | Contratos | Gestão de locações |
| 9 | Financeiro | Motor de faturas e pagamentos |
| 10 | Régua de Cobrança | Automação de cobranças |
| 11 | WhatsApp | Integração Meta Graph API |
| 12 | Dashboard | Agregações e métricas |

---

## 🔑 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
|----------|----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Chave secreta para assinar tokens | `minha-chave-secreta-segura` |
| `JWT_EXPIRES_IN` | Tempo de expiração do access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Tempo de expiração do refresh token | `7d` |
| `APP_PORT` | Porta do servidor | `3001` |
| `SUPER_ADMIN_EMAIL` | Email do admin inicial | `admin@saasimobiliaria.com` |
| `SUPER_ADMIN_PASSWORD` | Senha do admin inicial | `Admin@123456` |
| `WHATSAPP_ACCESS_TOKEN` | Token da API do WhatsApp | (opcional) |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número no WhatsApp Business | (opcional) |

---

## 📄 Licença

Este projeto é de uso privado.

---

<p align="center">
  Desenvolvido com ☕ e muitas linhas de TypeScript
</p>
