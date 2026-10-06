# Etapa 1 — Análise do Produto e Arquitetura Inicial

---

## 1. Avaliação da Ideia

A ideia é **sólida e resolve um problema real**. O mercado imobiliário brasileiro tem características que favorecem esse tipo de produto:

- Imobiliárias pequenas e médias (a grande maioria do mercado) ainda gerenciam cobranças em planilhas, sistemas legados ou manualmente.
- A inadimplência de aluguel é um problema crônico — segundo dados do mercado, a taxa de inadimplência em locações residenciais oscila entre 5% e 10% dependendo da região e do momento econômico.
- A comunicação com inquilinos inadimplentes costuma ser feita por telefone ou e-mail — canais com baixa taxa de resposta comparados ao WhatsApp.
- Soluções existentes no mercado (como Superlógica, Imoview, Vista) são caras e/ou genéricas demais, focando em CRM de vendas e não em **gestão de inadimplência ativa**.

**Viabilidade:** alta. O problema é claro, o público é identificável, e a solução pode começar pequena e crescer.

**Risco de mercado:** moderado. Existe concorrência, mas o foco em **automação de cobrança** é um nicho pouco explorado por soluções acessíveis.

---

## 2. Problema que Estamos Resolvendo

Vamos ser precisos aqui. O problema **não** é "imobiliárias precisam de um sistema". O problema real é:

> **Imobiliárias pequenas e médias perdem dinheiro e tempo porque o processo de identificação, acompanhamento e cobrança de inquilinos inadimplentes é manual, desorganizado e ineficiente.**

Desdobrando:

| Dor | Consequência |
|-----|-------------|
| Funcionários precisam verificar manualmente quais aluguéis estão em atraso | Atrasos são identificados tarde demais |
| Cobranças são feitas por telefone, uma a uma | Baixa produtividade, alto custo operacional |
| Não há histórico organizado de cobranças | Não se sabe quem já foi cobrado, quando, ou o resultado |
| Inquilinos não têm formas fáceis de pagar | Atrito no pagamento aumenta a inadimplência |
| Proprietários cobram informações que a imobiliária demora para consolidar | Desgaste no relacionamento com o cliente (proprietário) |
| Falta visibilidade financeira em tempo real | Decisões são tomadas no escuro |

O produto resolve isso automatizando o ciclo:

```
Vencimento → Identificação de atraso → Cobrança automática → Facilitação do pagamento → Registro → Relatório
```

---

## 3. Quem São os Usuários

Existem **perfis distintos** que vão usar o sistema de formas diferentes:

### Usuários Diretos (dentro da imobiliária)

| Perfil | O que faz no sistema | Prioridade |
|--------|---------------------| -----------|
| **Administrador da Imobiliária** | Configura o sistema, gerencia funcionários, vê dashboards, toma decisões estratégicas | Alta |
| **Funcionário Financeiro** | Gerencia contas a receber, acompanha inadimplência, dispara cobranças, registra pagamentos | Alta |
| **Funcionário Operacional** | Cadastra imóveis, contratos, inquilinos, proprietários | Alta |
| **Gestor/Dono** | Visualiza relatórios, indicadores, situação geral | Média |

### Usuários Indiretos (recebem ações do sistema)

| Perfil | Interação | Prioridade |
|--------|-----------|-----------|
| **Inquilino** | Recebe cobranças no WhatsApp, acessa links de pagamento | Alta (não usa o painel, mas é impactado) |
| **Proprietário** | Pode receber relatórios sobre seus imóveis (futuro) | Baixa (versão futura) |

### Superusuário (você/plataforma)

| Perfil | O que faz | Prioridade |
|--------|-----------|-----------|
| **Admin da Plataforma (Super Admin)** | Gerencia as imobiliárias cadastradas, monitora a saúde do SaaS | Média (necessário, mas é interno) |

> [!IMPORTANT]
> No MVP, foque nos **usuários diretos da imobiliária**. O inquilino interage apenas via WhatsApp e links de pagamento — ele **não** precisa de login no sistema inicialmente.

---

## 4. Diferenciais Competitivos

Para competir, o produto precisa de posicionamento claro. Aqui está o que pode diferenciá-lo:

### Diferencial Principal
**Automação inteligente de cobrança com WhatsApp integrado.**

A maioria dos sistemas imobiliários trata a cobrança como um relatório — "aqui estão os inadimplentes, ligue pra eles". Nosso sistema **age**: identifica, monta a mensagem, envia, acompanha, e registra.

### Diferenciais Secundários

| Diferencial | Por que importa |
|-------------|----------------|
| **Custo acessível** | Concorrentes como Superlógica cobram por unidade gerenciada. Um SaaS mais barato com foco em cobrança tem espaço |
| **WhatsApp como canal principal** | Canal com ~98% de taxa de abertura no Brasil. E-mail e telefone são inferiores para esse caso de uso |
| **IA para personalização de mensagens** | Mensagens genéricas são ignoradas. Mensagens que consideram contexto (histórico do inquilino, tempo de atraso, etc.) têm melhor resposta |
| **Dashboard focado em inadimplência** | Não é um dashboard genérico — é uma visão financeira orientada a ação |
| **Simplicidade** | Imobiliárias pequenas não querem SAP. Querem algo que funcione em 5 minutos |

---

## 5. Riscos do Projeto

### Riscos Técnicos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Bloqueio do WhatsApp** | 🔴 Alto | Usar apenas a API oficial (Cloud API). Nunca usar soluções não-oficiais (baileys, venom, etc.) em produção comercial |
| **Segurança de dados financeiros** | 🔴 Alto | LGPD, criptografia, isolamento de dados entre imobiliárias, auditoria |
| **Complexidade do multi-tenancy** | 🟡 Médio | Escolher a estratégia certa desde o início |
| **Escalabilidade prematura** | 🟡 Médio | Não otimizar para 10.000 clientes quando teremos 1. Manter simples |
| **Dependência de APIs externas** | 🟡 Médio | WhatsApp, gateway de pagamento, IA — todas podem falhar. Precisamos de filas, retentativas e fallbacks |

### Riscos de Negócio

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Não validar com o cliente real cedo o suficiente** | 🔴 Alto | Entregar um MVP funcional rápido e iterar com feedback real |
| **Escopo muito grande** | 🔴 Alto | As 22 etapas que você definiu são boas, mas precisamos de um MVP enxuto |
| **Concorrência com mais recursos** | 🟡 Médio | Competir em nicho (cobrança), não em features |
| **Precificação errada** | 🟡 Médio | Pesquisar antes de lançar |

### Riscos de Aprendizado

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| **Tentar aprender tudo ao mesmo tempo** | 🟡 Médio | As etapas ajudam, mas respeite o ritmo |
| **Perfeccionismo técnico** | 🟡 Médio | "Bom o suficiente" é melhor que "perfeito nunca entregue" |

---

## 6. Funcionalidades do Primeiro Lançamento (MVP)

> [!IMPORTANT]
> MVP não significa "sistema incompleto". Significa **o menor produto que entrega valor real ao cliente**.

### ✅ MVP — O que precisa existir

| Módulo | Funcionalidades |
|--------|----------------|
| **Autenticação** | Login, logout, JWT, refresh token, hash de senhas |
| **Multi-tenancy** | Isolamento de dados por imobiliária |
| **Cadastros base** | Imobiliária, imóveis, proprietários, inquilinos |
| **Contratos** | Cadastro de contratos de aluguel com valor, vencimento, vigência |
| **Financeiro** | Geração automática de cobranças mensais + integração com gateway de pagamento (Pix, boleto, cartão) |
| **Inadimplência** | Identificação automática de pagamentos em atraso |
| **Cobranças via WhatsApp** | Envio de mensagens de cobrança com 3 modos de operação |
| **Dashboard** | Visão geral: total a receber, total em atraso, inadimplentes, cobranças enviadas |
| **Usuários e permissões** | Sistema de roles customizáveis pelo dono da imobiliária |
| **Logs** | Registro de ações críticas (quem fez o quê, quando) |

### ⏳ Funcionalidades Futuras (por Ondas)

**Onda 2 (estabilização):**
- Relatórios em PDF
- Régua de cobrança automática avançada
- Filtros e buscas avançadas

**Onda 3 (inteligência):**
- IA para personalizar mensagens de cobrança
- Portal do proprietário
- Notificações internas

**Onda 4 (escala):**
- Análise preditiva de inadimplência
- Classificação automática de respostas (IA)
- API pública
- App mobile ou PWA

---

## 7. Proposta de Arquitetura Inicial

### Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                    INTERNET                          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                 NGINX (Reverse Proxy)                │
│           SSL/TLS termination, rate limiting         │
│              serve static files (frontend)           │
└────────┬───────────────────────────────┬─────────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐           ┌─────────────────────┐
│    FRONTEND     │           │      BACKEND        │
│   React + Vite  │           │  NestJS + TypeScript │
│  (static files) │           │     (API REST)       │
└─────────────────┘           └──────┬──────────────┘
                                     │
                              ┌──────┴──────┐
                              │             │
                              ▼             ▼
                    ┌──────────────┐  ┌───────────┐
                    │  PostgreSQL  │  │  Redis*   │
                    │    (dados)   │  │ (filas)*  │
                    └──────────────┘  └───────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Serviços Externos│
                                  │  - WhatsApp API   │
                                  │  - Gateway Pgto   │
                                  │  - API de IA      │
                                  └──────────────────┘
```

*\* Redis: será avaliado quando necessário. No MVP, filas podem ser resolvidas com uma tabela de jobs no PostgreSQL (poll-based).*

### Padrão Arquitetural: Monolito Modular

> [!IMPORTANT]
> **Não vamos começar com microsserviços.** Isso seria overengineering para o estágio atual.

Um **monolito modular** significa:
- Uma única aplicação NestJS
- Organizada internamente em **módulos independentes**
- Cada módulo (auth, tenants, properties, billing, etc.) tem seus próprios controllers, services, e repositórios
- Se um dia precisarmos extrair um módulo para um serviço separado, a separação já estará feita no código

---

## 8. Stack Tecnológica Recomendada

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Arquitetura | Monolito Modular | Simples, suficiente, fácil de manter |
| Backend | NestJS + TypeScript | Estruturado, tipado, leve |
| Frontend | React + Vite (SPA) | Maduro, grande ecossistema |
| Banco | PostgreSQL | Robusto, relacional, ideal para dados financeiros |
| ORM | Prisma (+ raw SQL) | Tipagem excelente, produtivo |
| Multi-tenancy | Shared DB + tenant_id | Simples, barato, funciona com Prisma |
| Infra | Docker + Compose + Nginx | Padrão da indústria, reproduzível |
| Cache/Filas | Sem Redis no MVP | Tabela de jobs no PostgreSQL resolve |
| WhatsApp | Cloud API (oficial Meta) | Seguro, sem risco de bloqueio, gratuito para volume baixo |
| IA | Gemini API (pós-MVP) | Custo-benefício, tier gratuito |
| Hospedagem | Oracle Free Tier (+ plano B) | Gratuito, suficiente |
| CI/CD | Manual no MVP, GitHub Actions depois | Não é prioridade no início |

---

## 9. Multi-tenancy — Decisão

**Escolha: Shared database + tenant_id (organization_id)**

- Todas as tabelas têm coluna `organization_id`
- Middleware/interceptor no NestJS injeta automaticamente o filtro em toda query
- Simples de implementar, funciona com Prisma, custo mínimo

> [!CAUTION]
> O filtro de `organization_id` **não pode depender do desenvolvedor lembrar de adicioná-lo**. Precisa ser automático (middleware/interceptor). Um único `SELECT * FROM payments` sem filtro é uma vulnerabilidade grave.

---

## 10. Respostas do Jonnathan (Validação)

1. **MVP:** Concordou com a divisão
2. **Primeiro cliente:** Não sabe quantos imóveis a imobiliária gerencia
3. **WhatsApp:** Não tem conta Meta Business ainda, vai comprar um chip
4. **Hospedagem:** Não tem conta na Oracle Cloud, vai criar conforme o desenvolvimento

