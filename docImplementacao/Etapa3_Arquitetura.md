# Etapa 3 — Arquitetura Detalhada

---

## 1. Visão Geral da Arquitetura

O sistema segue o padrão **Monolito Modular**: uma única aplicação NestJS organizada em módulos independentes, cada um responsável por um domínio de negócio.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                          │
│                        React + Vite (SPA)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                         │
│              SSL termination · Rate Limiting · CORS                │
│         GET /  → serve static (React)                              │
│         /api/* → proxy_pass backend:3000                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NESTJS (API REST)                               │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐          │
│  │   Auth   │  Orgs    │ Property │ Billing  │ WhatsApp │          │
│  │  Module  │  Module  │  Module  │  Module  │  Module  │   ...    │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘          │
│                                                                     │
│  Guards · Interceptors · Pipes · Filters · Middleware               │
└──────────┬──────────────────────┬───────────────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────┐    ┌──────────────────────┐
│   PostgreSQL    │    │   Serviços Externos  │
│   (via Prisma)  │    │  · WhatsApp Cloud API│
│                 │    │  · Gateway Pagamento │
└─────────────────┘    │  · Email (futuro)    │
                       └──────────────────────┘
```

---

## 2. Estrutura de Pastas do Projeto

```
SaaSImobiliaria/
├── docImplementacao/           # Documentação do projeto (onde estamos)
│   ├── Etapa1_AnaliseProduto.md
│   ├── Etapa2_Requisitos.md
│   └── Etapa3_Arquitetura.md
│
├── backend/                    # Aplicação NestJS
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco de dados
│   │   ├── migrations/         # Migrations geradas pelo Prisma
│   │   └── seed.ts             # Dados iniciais (seed)
│   │
│   ├── src/
│   │   ├── main.ts             # Entry point da aplicação
│   │   ├── app.module.ts       # Módulo raiz
│   │   │
│   │   ├── common/             # Código compartilhado entre módulos
│   │   │   ├── decorators/     # Decorators customizados
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── permissions.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── guards/         # Guards de autenticação e autorização
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── permissions.guard.ts
│   │   │   ├── interceptors/   # Interceptors globais
│   │   │   │   ├── tenant.interceptor.ts       # Injeta organization_id
│   │   │   │   └── audit-log.interceptor.ts    # Registra ações
│   │   │   ├── filters/        # Exception filters
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── pipes/          # Validation pipes
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── dto/            # DTOs compartilhados
│   │   │   │   └── pagination.dto.ts
│   │   │   ├── interfaces/     # Interfaces compartilhadas
│   │   │   │   └── request-with-user.interface.ts
│   │   │   └── utils/          # Funções utilitárias
│   │   │       ├── cpf-cnpj.util.ts
│   │   │       └── date.util.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                   # Autenticação
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── token-response.dto.ts
│   │   │   │
│   │   │   ├── organizations/          # Imobiliárias
│   │   │   │   ├── organizations.module.ts
│   │   │   │   ├── organizations.controller.ts
│   │   │   │   ├── organizations.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-organization.dto.ts
│   │   │   │       └── update-organization.dto.ts
│   │   │   │
│   │   │   ├── users/                  # Usuários
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── roles/                  # Roles e Permissões (RBAC dinâmico)
│   │   │   │   ├── roles.module.ts
│   │   │   │   ├── roles.controller.ts
│   │   │   │   ├── roles.service.ts
│   │   │   │   ├── permissions.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── properties/             # Imóveis
│   │   │   │   ├── properties.module.ts
│   │   │   │   ├── properties.controller.ts
│   │   │   │   ├── properties.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── owners/                 # Proprietários
│   │   │   │   ├── owners.module.ts
│   │   │   │   ├── owners.controller.ts
│   │   │   │   ├── owners.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── tenants/                # Inquilinos
│   │   │   │   ├── tenants.module.ts
│   │   │   │   ├── tenants.controller.ts
│   │   │   │   ├── tenants.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── contracts/              # Contratos
│   │   │   │   ├── contracts.module.ts
│   │   │   │   ├── contracts.controller.ts
│   │   │   │   ├── contracts.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── billing/                # Financeiro (cobranças + pagamentos)
│   │   │   │   ├── billing.module.ts
│   │   │   │   ├── billing.controller.ts
│   │   │   │   ├── billing.service.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── payment-gateway.service.ts  # Integração com gateway
│   │   │   │   ├── webhook.controller.ts       # Recebe webhooks do gateway
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── delinquency/            # Inadimplência
│   │   │   │   ├── delinquency.module.ts
│   │   │   │   ├── delinquency.controller.ts
│   │   │   │   ├── delinquency.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── collections/            # Cobranças (mensagens WhatsApp)
│   │   │   │   ├── collections.module.ts
│   │   │   │   ├── collections.controller.ts
│   │   │   │   ├── collections.service.ts
│   │   │   │   ├── collection-engine.service.ts  # Motor dos 3 modos
│   │   │   │   ├── templates.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── whatsapp/               # Integração WhatsApp Cloud API
│   │   │   │   ├── whatsapp.module.ts
│   │   │   │   ├── whatsapp.service.ts
│   │   │   │   ├── whatsapp-webhook.controller.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── settings/               # Configurações da organização
│   │   │   │   ├── settings.module.ts
│   │   │   │   ├── settings.controller.ts
│   │   │   │   ├── settings.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── dashboard/              # Dashboard
│   │   │   │   ├── dashboard.module.ts
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   └── dashboard.service.ts
│   │   │   │
│   │   │   ├── audit-log/              # Logs de auditoria
│   │   │   │   ├── audit-log.module.ts
│   │   │   │   ├── audit-log.controller.ts
│   │   │   │   └── audit-log.service.ts
│   │   │   │
│   │   │   └── prisma/                 # Módulo do Prisma (database)
│   │   │       ├── prisma.module.ts
│   │   │       └── prisma.service.ts
│   │   │
│   │   └── config/                     # Configurações da aplicação
│   │       └── env.validation.ts
│   │
│   ├── test/                           # Testes
│   │   ├── unit/
│   │   └── e2e/
│   │
│   ├── .env.example                    # Template de variáveis de ambiente
│   ├── .env                            # Variáveis de ambiente (NÃO vai pro git)
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
│
├── frontend/                   # Aplicação React (será detalhada na etapa de frontend)
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml          # Orquestração dos containers
├── docker-compose.dev.yml      # Override para desenvolvimento
├── .gitignore
└── README.md
```

> [!NOTE]
> **Por que essa estrutura?** Cada módulo é autocontido: tem seu controller, service, DTOs. Se um dia precisarmos extrair o módulo `billing` para um microsserviço, basta copiar a pasta. O diretório `common/` contém código compartilhado que não pertence a nenhum módulo específico.

---

## 3. Schema do Banco de Dados (ERD)

### Diagrama de Entidades e Relacionamentos

```mermaid
erDiagram
    Organization ||--o{ User : "tem"
    Organization ||--o{ Role : "tem"
    Organization ||--o{ Property : "tem"
    Organization ||--o{ Owner : "tem"
    Organization ||--o{ Tenant : "tem"
    Organization ||--o{ Contract : "tem"
    Organization ||--o{ CollectionTemplate : "tem"
    Organization ||--|| OrganizationSettings : "tem"

    Role ||--o{ RolePermission : "tem"
    Permission ||--o{ RolePermission : "usada em"
    User }o--|| Role : "possui"

    Owner ||--o{ Property : "possui"
    Property ||--o{ Contract : "vinculado a"
    Tenant ||--o{ Contract : "vinculado a"

    Contract ||--o{ Billing : "gera"
    Billing ||--o{ Payment : "recebe"
    Billing ||--o{ CollectionMessage : "gera"

    Organization ||--o{ AuditLog : "registra"
    User ||--o{ AuditLog : "executa"
```

### Definição Completa das Tabelas

#### organizations (Imobiliárias)
```sql
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    address_street  VARCHAR(255),
    address_number  VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city    VARCHAR(100),
    address_state   CHAR(2),
    address_zip     VARCHAR(10),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### organization_settings (Configurações por organização)
```sql
CREATE TABLE organization_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL UNIQUE REFERENCES organizations(id),

    -- Multa e Juros
    penalty_percentage  DECIMAL(5,2) NOT NULL DEFAULT 2.00,   -- % multa por atraso
    interest_percentage DECIMAL(5,2) NOT NULL DEFAULT 1.00,   -- % juros ao mês
    grace_period_days   INTEGER NOT NULL DEFAULT 0,            -- dias de carência

    -- Modo de Cobrança
    collection_mode     SMALLINT NOT NULL DEFAULT 2,
    -- 1 = Desativado, 2 = Supervisionado, 3 = Autônomo

    -- Gateway de Pagamento
    payment_gateway     VARCHAR(50) DEFAULT 'asaas',
    payment_gateway_api_key TEXT,                               -- criptografado

    -- WhatsApp
    whatsapp_phone_number_id VARCHAR(100),
    whatsapp_business_account_id VARCHAR(100),
    whatsapp_api_token  TEXT,                                   -- criptografado

    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

> [!CAUTION]
> Os campos `payment_gateway_api_key`, `whatsapp_api_token` devem ser **criptografados em repouso** (AES-256 ou similar). Nunca armazenamos API keys em texto puro no banco.

#### permissions (Permissões do sistema — tabela estática)
```sql
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,   -- ex: 'properties.create'
    group_name  VARCHAR(50) NOT NULL,            -- ex: 'properties'
    description VARCHAR(255) NOT NULL,           -- ex: 'Criar imóveis'
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Dados iniciais (seed):
-- properties.create, properties.read, properties.update, properties.delete
-- owners.create, owners.read, owners.update, owners.delete
-- tenants.create, tenants.read, tenants.update, tenants.delete
-- contracts.create, contracts.read, contracts.update, contracts.delete
-- billing.read, billing.manage, billing.configure
-- collections.read, collections.send, collections.configure
-- delinquency.read, delinquency.manage
-- dashboard.read
-- users.create, users.read, users.update, users.delete
-- roles.create, roles.read, roles.update, roles.delete
-- logs.read
-- settings.read, settings.update
```

#### roles (Papéis — dinâmicos por organização)
```sql
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    is_system       BOOLEAN NOT NULL DEFAULT false,  -- true = role padrão (não pode deletar)
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, name)
);
```

#### role_permissions (Relação N:N entre roles e permissions)
```sql
CREATE TABLE role_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id),

    UNIQUE(role_id, permission_id)
);
```

#### users (Usuários)
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role_id         UUID NOT NULL REFERENCES roles(id),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt/argon2
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMP,
    login_attempts  INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMP,                       -- bloqueio por brute force
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, email)
);
```

#### refresh_tokens (Tokens de renovação)
```sql
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,       -- hash do token (nunca texto puro)
    expires_at  TIMESTAMP NOT NULL,
    revoked_at  TIMESTAMP,                    -- se != null, foi invalidado
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### owners (Proprietários)
```sql
CREATE TABLE owners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    cpf_cnpj        VARCHAR(18) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    address_street  VARCHAR(255),
    address_city    VARCHAR(100),
    address_state   CHAR(2),
    address_zip     VARCHAR(10),
    bank_name       VARCHAR(100),
    bank_agency     VARCHAR(20),
    bank_account    VARCHAR(30),
    bank_pix_key    VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, cpf_cnpj)
);
```

#### properties (Imóveis)
```sql
CREATE TABLE properties (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    owner_id        UUID NOT NULL REFERENCES owners(id),
    type            VARCHAR(50) NOT NULL,       -- casa, apartamento, sala_comercial, etc
    address_street  VARCHAR(255) NOT NULL,
    address_number  VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city    VARCHAR(100) NOT NULL,
    address_state   CHAR(2) NOT NULL,
    address_zip     VARCHAR(10),
    area_sqm        DECIMAL(10,2),              -- área em m²
    bedrooms        SMALLINT,
    bathrooms       SMALLINT,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'available',
    -- available, rented, maintenance, inactive
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### tenants (Inquilinos)
```sql
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,
    cpf             VARCHAR(14) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    whatsapp        VARCHAR(20) NOT NULL,        -- obrigatório para cobranças
    previous_address VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, cpf)
);
```

#### contracts (Contratos de aluguel)
```sql
CREATE TABLE contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    property_id     UUID NOT NULL REFERENCES properties(id),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    owner_id        UUID NOT NULL REFERENCES owners(id),

    rent_amount     DECIMAL(12,2) NOT NULL,      -- valor do aluguel
    due_day         SMALLINT NOT NULL,            -- dia do vencimento (1-31)
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'active',
    -- active, terminated, cancelled
    notes           TEXT,

    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Um imóvel só pode ter um contrato ativo por vez
    -- (validado via lógica de negócio + partial unique index)
    CONSTRAINT check_end_after_start CHECK (end_date > start_date),
    CONSTRAINT check_due_day CHECK (due_day BETWEEN 1 AND 31)
);

-- Índice parcial: garante no máximo 1 contrato ativo por imóvel
CREATE UNIQUE INDEX idx_one_active_contract_per_property
ON contracts (property_id)
WHERE status = 'active';
```

#### contract_adjustments (Reajustes de contrato)
```sql
CREATE TABLE contract_adjustments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id     UUID NOT NULL REFERENCES contracts(id),
    previous_amount DECIMAL(12,2) NOT NULL,
    new_amount      DECIMAL(12,2) NOT NULL,
    adjustment_date DATE NOT NULL,
    reason          VARCHAR(255),
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### billings (Cobranças mensais geradas automaticamente)
```sql
CREATE TABLE billings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id),
    contract_id         UUID NOT NULL REFERENCES contracts(id),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),

    reference_month     DATE NOT NULL,              -- mês de referência (YYYY-MM-01)
    amount              DECIMAL(12,2) NOT NULL,     -- valor original
    penalty_amount      DECIMAL(12,2) DEFAULT 0,    -- multa calculada
    interest_amount     DECIMAL(12,2) DEFAULT 0,    -- juros calculados
    total_amount        DECIMAL(12,2) NOT NULL,     -- total (amount + penalty + interest)
    due_date            DATE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, overdue, paid, partially_paid, cancelled

    -- Dados do gateway de pagamento
    gateway_charge_id   VARCHAR(255),                -- ID da cobrança no gateway
    gateway_pix_qrcode  TEXT,                        -- QR Code Pix
    gateway_boleto_url  VARCHAR(500),                -- URL do boleto
    gateway_payment_url VARCHAR(500),                -- Link de pagamento geral

    paid_at             TIMESTAMP,
    cancelled_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(contract_id, reference_month)
);
```

#### payments (Pagamentos recebidos)
```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    billing_id      UUID NOT NULL REFERENCES billings(id),

    amount          DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,       -- pix, boleto, credit_card, manual
    payment_date    TIMESTAMP NOT NULL,
    gateway_payment_id VARCHAR(255),            -- ID do pagamento no gateway

    -- Para pagamento manual
    registered_by   UUID REFERENCES users(id),  -- quem registrou (se manual)
    notes           TEXT,

    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### collection_templates (Templates de mensagens de cobrança)
```sql
CREATE TABLE collection_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50) NOT NULL,       -- reminder, collection, warning, final_notice
    days_overdue_min SMALLINT,                  -- aplicável a partir de X dias de atraso
    days_overdue_max SMALLINT,                  -- aplicável até X dias de atraso
    message_body    TEXT NOT NULL,               -- texto com placeholders: {{nome}}, {{valor}}, etc.
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### collection_messages (Mensagens de cobrança enviadas/pendentes)
```sql
CREATE TABLE collection_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    billing_id      UUID NOT NULL REFERENCES billings(id),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    template_id     UUID REFERENCES collection_templates(id),

    channel         VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
    message_body    TEXT NOT NULL,               -- mensagem final (com placeholders preenchidos)
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending_approval (modo 2), pending, sent, delivered, read, failed

    approved_by     UUID REFERENCES users(id),  -- quem aprovou (modo 2)
    approved_at     TIMESTAMP,
    sent_at         TIMESTAMP,
    delivered_at    TIMESTAMP,
    read_at         TIMESTAMP,
    error_message   TEXT,                        -- motivo da falha, se falhou

    whatsapp_message_id VARCHAR(255),            -- ID da mensagem no WhatsApp

    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### audit_logs (Logs de auditoria)
```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),      -- null para ações do super admin
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,       -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    entity_type     VARCHAR(50) NOT NULL,       -- organization, user, property, billing, etc.
    entity_id       UUID,
    old_data        JSONB,                      -- dados anteriores (para UPDATE/DELETE)
    new_data        JSONB,                      -- dados novos (para CREATE/UPDATE)
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NÃO tem updated_at. Logs são imutáveis.
-- NÃO tem DELETE. Logs nunca são apagados.
```

### Índices Importantes

```sql
-- Multi-tenancy: todo módulo filtra por organization_id
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_properties_org ON properties(organization_id);
CREATE INDEX idx_owners_org ON owners(organization_id);
CREATE INDEX idx_tenants_org ON tenants(organization_id);
CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_billings_org ON billings(organization_id);
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_collection_messages_org ON collection_messages(organization_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);

-- Performance: queries frequentes
CREATE INDEX idx_billings_status ON billings(status);
CREATE INDEX idx_billings_due_date ON billings(due_date);
CREATE INDEX idx_billings_contract ON billings(contract_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_property ON contracts(property_id);
CREATE INDEX idx_collection_messages_status ON collection_messages(status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

---

## 4. Fluxo de Autenticação e Autorização

### 4.1 Login

```
Cliente                    Backend                     Banco
  │                          │                          │
  │  POST /api/auth/login    │                          │
  │  { email, password }     │                          │
  │─────────────────────────>│                          │
  │                          │  Busca user por email    │
  │                          │─────────────────────────>│
  │                          │  { user + role + perms } │
  │                          │<─────────────────────────│
  │                          │                          │
  │                          │  Verifica:               │
  │                          │  - user existe?          │
  │                          │  - is_active?            │
  │                          │  - locked_until?         │
  │                          │  - bcrypt.compare()      │
  │                          │                          │
  │  { accessToken,          │                          │
  │    refreshToken,         │                          │
  │    user, permissions }   │                          │
  │<─────────────────────────│                          │
```

### 4.2 JWT Payload (Access Token)

```json
{
  "sub": "user-uuid",
  "org": "organization-uuid",
  "role": "role-uuid",
  "permissions": ["properties.read", "billing.manage", "..."],
  "iat": 1234567890,
  "exp": 1234568790
}
```

> [!NOTE]
> As permissões vão no payload do JWT para evitar consultas ao banco em cada request. Se o ADMIN alterar as permissões de uma role, o efeito só é sentido quando o token é renovado (no máximo 15 minutos). Isso é aceitável.

### 4.3 Fluxo de Autorização em Cada Request

```
Request chega com Bearer Token
         │
         ▼
┌─────────────────┐
│  JwtAuthGuard   │──── Token inválido/expirado? → 401 Unauthorized
│  (global)       │
└────────┬────────┘
         │ token válido
         ▼
┌─────────────────┐
│ TenantInterceptor│──── Extrai org_id do token
│  (global)        │     Injeta em toda query do Prisma
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│PermissionsGuard │──── Verifica se o user tem a permissão
│ (@Permissions())│     requerida pelo endpoint
└────────┬────────┘     Ex: @Permissions('properties.create')
         │ autorizado
         ▼
    Controller → Service → Prisma (com org_id filtrado)
```

---

## 5. Multi-tenancy — Implementação Técnica

### Estratégia: Prisma Client Extension + Interceptor

O objetivo é **nunca depender do desenvolvedor** para filtrar por `organization_id`. O filtro é automático.

**Como funciona:**

1. O `JwtAuthGuard` valida o token e extrai o `org` (organization_id)
2. O `TenantInterceptor` injeta o `organization_id` no contexto da request
3. O `PrismaService` usa uma **Prisma Client Extension** que intercepta todas as queries e adiciona `WHERE organization_id = ?` automaticamente

```typescript
// Conceito simplificado do TenantInterceptor
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // vem do JwtAuthGuard

    // Injeta o organization_id no request para uso nos services
    request.organizationId = user.org;

    return next.handle();
  }
}
```

```typescript
// Conceito do Prisma Extension para multi-tenancy
// Toda query recebe WHERE organization_id = X automaticamente
const prismaWithTenant = prisma.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, organization_id: tenantId };
        return query(args);
      },
      async create({ args, query }) {
        args.data = { ...args.data, organization_id: tenantId };
        return query(args);
      },
      // ... mesmo para update, delete, findFirst, etc.
    }
  }
});
```

> [!CAUTION]
> **Exceções ao filtro automático:**
> - Tabela `organizations`: o Super Admin precisa listar todas
> - Tabela `permissions`: é global (não pertence a nenhuma organização)
> - Endpoint de login: o user ainda não está autenticado
> - Webhooks do gateway/WhatsApp: não têm JWT, usam validação própria
>
> Essas exceções devem ser **explicitamente declaradas** no código.

---

## 6. Endpoints da API REST

### Convenções

- Base URL: `/api/v1`
- Autenticação: `Authorization: Bearer <token>` (exceto endpoints públicos)
- Paginação: `?page=1&limit=20`
- Formato: JSON
- Respostas: `{ data, meta }` para listas, `{ data }` para itens

### 6.1 Auth

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/auth/login` | Público | Login |
| POST | `/auth/refresh` | Público (com refresh token) | Renovar access token |
| POST | `/auth/logout` | Autenticado | Invalidar refresh token |

### 6.2 Organizations

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/organizations` | Super Admin | Criar organização |
| GET | `/organizations` | Super Admin | Listar organizações |
| GET | `/organizations/:id` | Super Admin | Detalhes |
| PATCH | `/organizations/:id` | Super Admin | Editar |
| DELETE | `/organizations/:id` | Super Admin | Desativar (soft) |

### 6.3 Users

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/users` | `users.create` | Criar usuário |
| GET | `/users` | `users.read` | Listar usuários da org |
| GET | `/users/:id` | `users.read` | Detalhes |
| PATCH | `/users/:id` | `users.update` | Editar |
| DELETE | `/users/:id` | `users.delete` | Desativar |
| GET | `/users/me` | Autenticado | Perfil do usuário logado |

### 6.4 Roles

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/roles` | `roles.create` | Criar role |
| GET | `/roles` | `roles.read` | Listar roles da org |
| GET | `/roles/:id` | `roles.read` | Detalhes (com permissões) |
| PATCH | `/roles/:id` | `roles.update` | Editar role (e permissões) |
| DELETE | `/roles/:id` | `roles.delete` | Excluir role |
| GET | `/permissions` | `roles.read` | Listar todas as permissões disponíveis |

### 6.5 Properties

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/properties` | `properties.create` | Criar imóvel |
| GET | `/properties` | `properties.read` | Listar |
| GET | `/properties/:id` | `properties.read` | Detalhes |
| PATCH | `/properties/:id` | `properties.update` | Editar |
| DELETE | `/properties/:id` | `properties.delete` | Desativar |

### 6.6 Owners

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/owners` | `owners.create` | Criar proprietário |
| GET | `/owners` | `owners.read` | Listar |
| GET | `/owners/:id` | `owners.read` | Detalhes (com imóveis) |
| PATCH | `/owners/:id` | `owners.update` | Editar |
| DELETE | `/owners/:id` | `owners.delete` | Desativar |

### 6.7 Tenants

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/tenants` | `tenants.create` | Criar inquilino |
| GET | `/tenants` | `tenants.read` | Listar |
| GET | `/tenants/:id` | `tenants.read` | Detalhes (com contratos/histórico) |
| PATCH | `/tenants/:id` | `tenants.update` | Editar |
| DELETE | `/tenants/:id` | `tenants.delete` | Desativar |

### 6.8 Contracts

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/contracts` | `contracts.create` | Criar contrato |
| GET | `/contracts` | `contracts.read` | Listar |
| GET | `/contracts/:id` | `contracts.read` | Detalhes |
| PATCH | `/contracts/:id` | `contracts.update` | Editar |
| POST | `/contracts/:id/terminate` | `contracts.update` | Encerrar contrato |
| POST | `/contracts/:id/adjustments` | `contracts.update` | Registrar reajuste |

### 6.9 Billing (Financeiro)

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | `/billings` | `billing.read` | Listar cobranças |
| GET | `/billings/:id` | `billing.read` | Detalhes da cobrança |
| POST | `/billings/:id/pay` | `billing.manage` | Registrar pagamento manual |
| POST | `/billings/:id/cancel` | `billing.manage` | Cancelar cobrança |
| POST | `/billings/generate` | `billing.manage` | Gerar cobranças do mês (manual trigger) |

**Webhook (público, validado por assinatura):**

| Método | Endpoint | Validação | Descrição |
|--------|----------|-----------|-----------|
| POST | `/webhooks/payment` | Assinatura do gateway | Receber confirmação de pagamento |

### 6.10 Delinquency (Inadimplência)

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | `/delinquency` | `delinquency.read` | Listar inadimplentes |
| GET | `/delinquency/summary` | `delinquency.read` | Resumo (totais, faixas) |
| GET | `/delinquency/:tenantId/history` | `delinquency.read` | Histórico por inquilino |

### 6.11 Collections (Cobranças via WhatsApp)

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/collections/send` | `collections.send` | Enviar cobrança manual |
| POST | `/collections/send-batch` | `collections.send` | Enviar em lote |
| GET | `/collections` | `collections.read` | Listar mensagens enviadas |
| GET | `/collections/pending-approval` | `collections.send` | Fila de aprovação (modo 2) |
| POST | `/collections/:id/approve` | `collections.send` | Aprovar envio (modo 2) |
| POST | `/collections/:id/reject` | `collections.send` | Rejeitar envio (modo 2) |

**Templates:**

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/collection-templates` | `collections.configure` | Criar template |
| GET | `/collection-templates` | `collections.read` | Listar templates |
| PATCH | `/collection-templates/:id` | `collections.configure` | Editar template |
| DELETE | `/collection-templates/:id` | `collections.configure` | Desativar template |

### 6.12 Settings

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | `/settings` | `settings.read` | Ver configurações da org |
| PATCH | `/settings/penalty` | `billing.configure` | Atualizar multa/juros |
| PATCH | `/settings/collection-mode` | `collections.configure` | Alterar modo de cobrança |
| PATCH | `/settings/payment-gateway` | `settings.update` | Configurar gateway |
| PATCH | `/settings/whatsapp` | `settings.update` | Configurar WhatsApp |

### 6.13 Dashboard

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | `/dashboard` | `dashboard.read` | Dados completos do dashboard |
| GET | `/dashboard/billing-summary` | `dashboard.read` | Resumo financeiro do mês |
| GET | `/dashboard/delinquency-rate` | `dashboard.read` | Taxa de inadimplência |
| GET | `/dashboard/top-delinquents` | `dashboard.read` | Maiores inadimplentes |

### 6.14 Audit Logs

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| GET | `/audit-logs` | `logs.read` | Listar logs (com filtros) |
| GET | `/audit-logs/:entityType/:entityId` | `logs.read` | Logs de uma entidade |

---

## 7. Fluxo do Gateway de Pagamento

```
                          ┌──────────────┐
  Geração de Cobranças    │   BACKEND    │
  (billing.service)       │              │
         │                │              │
         ▼                │              │
  Criar cobrança no BD    │              │
         │                │              │
         ▼                │              │
  Chamar API do Gateway   │              │
  (criar charge)          │              │         ┌──────────┐
         │                │              │────────>│ GATEWAY  │
         │                │              │         │ (Asaas/  │
         │                │              │<────────│  MP/etc) │
         ▼                │              │         └──────────┘
  Salvar IDs do gateway   │              │
  (pix qrcode, boleto     │              │
   url, payment link)     │              │
         │                │              │
         ▼                │              │
  Link de pagamento       │              │
  enviado ao inquilino    │              │
  via WhatsApp            │              │
                          │              │
  ─── Tempo passa ───     │              │
                          │              │
  Inquilino paga!         │              │
         │                │              │
         ▼                │              │
  Gateway envia webhook   │              │
  POST /webhooks/payment  │              │
         │                │              │
         ▼                │              │
  1. Validar assinatura   │              │
  2. Buscar billing pelo  │              │
     gateway_charge_id    │              │
  3. Registrar Payment    │              │
  4. Atualizar status     │              │
     billing → 'paid'     │              │
  5. Log de auditoria     │              │
                          └──────────────┘
```

> [!IMPORTANT]
> **Segurança dos Webhooks:** O webhook é um endpoint público (não tem JWT). A validação é feita por **assinatura**: o gateway envia um header com um HMAC-SHA256 do corpo da request, usando uma secret key que configuramos. Se a assinatura não bater, rejeitamos.

---

## 8. Fluxo dos 3 Modos de Cobrança

### Motor de Cobranças (collection-engine.service.ts)

```
  Cron Job (ex: todo dia às 8h)
  ou trigger manual
         │
         ▼
  Buscar billings com
  status = 'overdue'
         │
         ▼
  Verificar collection_mode
  da organização
         │
         ├── Modo 1 (Desativado)
         │      → NÃO faz nada automático
         │      → Funcionário envia via UI manualmente
         │
         ├── Modo 2 (Supervisionado)
         │      → Seleciona template pela faixa de atraso
         │      → Preenche placeholders ({{nome}}, {{valor}}, etc.)
         │      → Cria collection_message com status 'pending_approval'
         │      → Aparece na fila de aprovação na UI
         │      → Funcionário aprova → sistema envia
         │      → Funcionário rejeita → descartada
         │
         └── Modo 3 (Autônomo)
                → Seleciona template pela faixa de atraso
                → Preenche placeholders
                → Cria collection_message com status 'pending'
                → Envia imediatamente via WhatsApp
                → Atualiza status para 'sent'
```

### Régua de Cobrança (aplicável nos modos 2 e 3)

| Dias em atraso | Categoria | Exemplo de template |
|---------------|-----------|-------------------|
| 1 dia | `reminder` | "Olá {{nome}}, identificamos que o aluguel de {{referencia}} vence hoje. Segue o link de pagamento: {{link}}" |
| 3-5 dias | `collection` | "{{nome}}, o aluguel de {{referencia}} (R$ {{valor}}) está em atraso há {{dias}} dias. Pague pelo link: {{link}}" |
| 15 dias | `warning` | "{{nome}}, informamos que o atraso de {{dias}} dias gera multa e juros. Valor atualizado: R$ {{total}}. Link: {{link}}" |
| 30+ dias | `final_notice` | "{{nome}}, último aviso referente ao aluguel de {{referencia}}. Valor com encargos: R$ {{total}}. Regularize: {{link}}" |

---

## 9. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: saas_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: saas_imobiliaria
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"       # remover em produção
    networks:
      - internal

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: saas_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/saas_imobiliaria
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      REFRESH_TOKEN_EXPIRES_IN: 7d
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - internal

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: saas_frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - internal

volumes:
  postgres_data:

networks:
  internal:
    driver: bridge
```

---

## 10. Padrões e Convenções do Código

### Padrão de resposta da API

```typescript
// Sucesso - item único
{
  "data": { ... },
  "message": "Imóvel criado com sucesso"
}

// Sucesso - lista com paginação
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}

// Erro
{
  "statusCode": 400,
  "message": "CNPJ já cadastrado",
  "error": "Bad Request"
}
```

### Validação de entrada (DTOs)

Usamos **class-validator** com decorators:

```typescript
// Exemplo: create-property.dto.ts
export class CreatePropertyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressStreet: string;

  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaSqm?: number;
}
```

### Nomenclatura

| Contexto | Padrão | Exemplo |
|----------|--------|---------|
| Tabelas (DB) | snake_case, plural | `collection_messages` |
| Colunas (DB) | snake_case | `organization_id` |
| Classes (TS) | PascalCase | `BillingService` |
| Métodos (TS) | camelCase | `findOverdueBillings()` |
| Arquivos | kebab-case | `billing.service.ts` |
| DTOs | PascalCase + Dto | `CreateContractDto` |
| Endpoints | kebab-case, plural | `/collection-templates` |
| Permissões | `recurso.ação` | `properties.create` |

---

## 11. Próximos Passos

Com a arquitetura definida, as próximas etapas são:

| Etapa | Conteúdo | Objetivo |
|-------|----------|----------|
| **4** | Setup do projeto | Criar repo, configurar NestJS, Prisma, Docker, variáveis de ambiente |
| **5** | Módulo Prisma + Schema | Implementar o schema.prisma, rodar migrations, seed |
| **6** | Módulo Auth | Login, JWT, refresh token, guards |
| **7** | Multi-tenancy | Interceptor, Prisma extension, testes de isolamento |
| **8** | RBAC Dinâmico | Roles, permissions, guards de permissão |
| **9** | Módulos de Cadastro | Properties, owners, tenants, contracts |
| **10** | Módulo Financeiro | Billing, payments, gateway integration |
| **11** | Módulo Inadimplência + Cobranças | Delinquency, collections, WhatsApp, 3 modos |
| **12** | Dashboard + Logs | Indicadores, audit logs |
| **13** | Frontend (React) | Setup, pages, componentes, integração com API |

