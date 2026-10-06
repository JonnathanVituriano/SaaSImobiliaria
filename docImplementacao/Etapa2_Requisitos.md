# Etapa 2 — Requisitos Funcionais e Não Funcionais (ATUALIZADA)

> [!NOTE]
> Este documento foi atualizado com base nas respostas de validação do Jonnathan em 30/08/2026. As mudanças em relação à versão original estão marcadas com 🔄.

---

## O que são requisitos e por que isso importa?

- **Requisito Funcional (RF):** Descreve **o que** o sistema faz. É uma ação, uma funcionalidade. Exemplo: "O sistema deve permitir cadastrar um imóvel."
- **Requisito Não Funcional (RNF):** Descreve **como** o sistema deve se comportar. São restrições de qualidade. Exemplo: "O sistema deve responder em menos de 500ms."

**Por que documentar isso?**
- Evita o famoso "ah, mas eu achei que ia ter isso" depois de meses de desenvolvimento.
- Serve como checklist para testar se o sistema está completo.
- Ajuda a priorizar o que construir primeiro.
- Em um produto comercial, isso é a base do que você entrega ao cliente.

---

## Requisitos Funcionais — MVP

Organizados por módulo. Cada requisito tem um ID para referência futura.

---

### Módulo: Autenticação e Sessão

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-AUTH-01 | O sistema deve permitir que um usuário faça login com e-mail e senha | MVP |
| RF-AUTH-02 | O sistema deve gerar um token JWT ao autenticar com sucesso | MVP |
| RF-AUTH-03 | O sistema deve emitir um refresh token para renovação de sessão sem novo login | MVP |
| RF-AUTH-04 | O sistema deve permitir logout (invalidação do refresh token) | MVP |
| RF-AUTH-05 | O sistema deve bloquear o acesso após múltiplas tentativas de login falhas (proteção contra brute force) | MVP |
| RF-AUTH-06 | O sistema deve permitir redefinição de senha via e-mail | Pós-MVP |
| RF-AUTH-07 | O sistema deve suportar autenticação de dois fatores (2FA) | Futuro |

**Conceitos que você vai aprender aqui:**
- Como JWT funciona (header, payload, signature)
- Diferença entre access token (curta duração) e refresh token (longa duração)
- Por que nunca armazenamos senhas em texto puro (bcrypt/argon2)
- O que é brute force e como rate limiting protege contra isso

---

### Módulo: Multi-tenancy (Isolamento de Dados)

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-MT-01 | Todo dado no sistema deve pertencer a uma organização (imobiliária) | MVP |
| RF-MT-02 | Um usuário autenticado só deve visualizar dados da sua organização | MVP |
| RF-MT-03 | O filtro de organização deve ser aplicado automaticamente em toda query ao banco | MVP |
| RF-MT-04 | O sistema deve impedir que um usuário acesse, modifique ou exclua dados de outra organização, mesmo manipulando a requisição | MVP |
| RF-MT-05 | O super admin da plataforma deve poder visualizar e gerenciar todas as organizações | MVP |

> [!CAUTION]
> RF-MT-03 e RF-MT-04 são **requisitos de segurança críticos**. Se falharem, uma imobiliária vê dados de outra. Vamos implementar isso como um middleware automático, não como algo que depende de lembrar de colocar `WHERE` em cada query.

---

### Módulo: Cadastro de Organizações (Imobiliárias)

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-ORG-01 | O sistema deve permitir cadastrar uma imobiliária com: nome, CNPJ, endereço, telefone, e-mail | MVP |
| RF-ORG-02 | O CNPJ deve ser único no sistema | MVP |
| RF-ORG-03 | O sistema deve permitir editar os dados da imobiliária | MVP |
| RF-ORG-04 | O sistema deve permitir desativar uma imobiliária (soft delete) | MVP |
| RF-ORG-05 | O sistema deve validar o formato do CNPJ | MVP |

**Nota sobre soft delete:** Nunca deletamos dados financeiros de verdade. "Desativar" marca o registro como inativo sem removê-lo do banco. Isso é obrigatório para integridade de dados e auditoria.

---

### 🔄 Módulo: Usuários e Permissões (RBAC Dinâmico)

> [!IMPORTANT]
> **MUDANÇA SIGNIFICATIVA:** O sistema de permissões agora é **dinâmico**. O dono da imobiliária pode criar, editar e excluir roles, e definir quais permissões cada role tem. Os 3 papéis padrão (ADMIN, FINANCEIRO, OPERACIONAL) são criados automaticamente ao cadastrar a organização, mas podem ser modificados.

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-USER-01 | O sistema deve permitir cadastrar usuários vinculados a uma organização | MVP |
| RF-USER-02 | 🔄 O sistema deve vir com 3 roles padrão (ADMIN, FINANCEIRO, OPERACIONAL) criados automaticamente ao registrar uma organização | MVP |
| RF-USER-03 | 🔄 O ADMIN/dono da imobiliária deve poder **criar novas roles** personalizadas | MVP |
| RF-USER-04 | 🔄 O ADMIN/dono deve poder **editar roles existentes** (incluindo as padrão), alterando quais permissões cada role possui | MVP |
| RF-USER-05 | 🔄 O ADMIN/dono deve poder **excluir roles** personalizadas (roles padrão podem ser editadas mas não excluídas) | MVP |
| RF-USER-06 | 🔄 O sistema deve ter uma lista de **permissões granulares por recurso** (ex: `properties.create`, `properties.read`, `properties.update`, `properties.delete`, `billing.read`, `billing.manage`, `collections.send`, etc.) | MVP |
| RF-USER-07 | 🔄 Cada role deve ser uma combinação de permissões selecionadas pelo ADMIN | MVP |
| RF-USER-08 | O sistema deve restringir funcionalidades com base nas permissões da role do usuário | MVP |
| RF-USER-09 | Somente o ADMIN pode gerenciar usuários e roles da organização | MVP |
| RF-USER-10 | O sistema deve permitir desativar um usuário (sem excluir) | MVP |
| RF-USER-11 | 🔄 O sistema deve impedir que o último ADMIN da organização seja desativado ou tenha sua role alterada | MVP |

**Permissões padrão sugeridas:**

| Recurso | Permissões disponíveis |
|---------|----------------------|
| Imóveis | `properties.create`, `properties.read`, `properties.update`, `properties.delete` |
| Proprietários | `owners.create`, `owners.read`, `owners.update`, `owners.delete` |
| Inquilinos | `tenants.create`, `tenants.read`, `tenants.update`, `tenants.delete` |
| Contratos | `contracts.create`, `contracts.read`, `contracts.update`, `contracts.delete` |
| Financeiro | `billing.read`, `billing.manage`, `billing.configure` |
| Cobranças | `collections.read`, `collections.send`, `collections.configure` |
| Inadimplência | `delinquency.read`, `delinquency.manage` |
| Dashboard | `dashboard.read` |
| Usuários | `users.create`, `users.read`, `users.update`, `users.delete` |
| Roles | `roles.create`, `roles.read`, `roles.update`, `roles.delete` |
| Logs | `logs.read` |
| Configurações | `settings.read`, `settings.update` |

**Roles padrão (criadas automaticamente):**

| Role | Permissões |
|------|-----------|
| **ADMIN** | Todas as permissões |
| **FINANCEIRO** | `billing.*`, `collections.*`, `delinquency.*`, `dashboard.read`, `tenants.read`, `contracts.read`, `properties.read` |
| **OPERACIONAL** | `properties.*`, `owners.*`, `tenants.*`, `contracts.*`, `dashboard.read` |

> [!NOTE]
> O dono da imobiliária tem **livre arbítrio total** para modificar essas roles ou criar novas. Por exemplo, pode criar uma role "ESTAGIÁRIO" com acesso apenas de leitura, ou uma role "GERENTE" com tudo exceto gerenciamento de usuários.

---

### Módulo: Cadastro de Imóveis

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-PROP-01 | O sistema deve permitir cadastrar imóveis com: endereço completo, tipo (casa, apartamento, sala comercial, etc.), área, número de quartos/banheiros, descrição | MVP |
| RF-PROP-02 | Cada imóvel deve estar vinculado a um proprietário | MVP |
| RF-PROP-03 | O sistema deve permitir registrar o status do imóvel: disponível, alugado, em manutenção, inativo | MVP |
| RF-PROP-04 | O sistema deve permitir buscar e filtrar imóveis | MVP |
| RF-PROP-05 | O sistema deve permitir upload de fotos do imóvel | Futuro |

---

### Módulo: Cadastro de Proprietários

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-OWN-01 | O sistema deve permitir cadastrar proprietários com: nome, CPF/CNPJ, telefone, e-mail, endereço, dados bancários | MVP |
| RF-OWN-02 | CPF/CNPJ do proprietário deve ser único dentro da organização | MVP |
| RF-OWN-03 | Um proprietário pode ter múltiplos imóveis | MVP |
| RF-OWN-04 | O sistema deve permitir visualizar todos os imóveis de um proprietário | MVP |
| RF-OWN-05 | O sistema deve permitir desativar um proprietário | MVP |

---

### Módulo: Cadastro de Inquilinos

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-TEN-01 | O sistema deve permitir cadastrar inquilinos com: nome, CPF, telefone, e-mail, endereço anterior | MVP |
| RF-TEN-02 | CPF do inquilino deve ser único dentro da organização | MVP |
| RF-TEN-03 | O sistema deve registrar o WhatsApp do inquilino (campo obrigatório para cobranças) | MVP |
| RF-TEN-04 | O sistema deve permitir buscar e filtrar inquilinos | MVP |
| RF-TEN-05 | O sistema deve permitir desativar um inquilino | MVP |

> [!IMPORTANT]
> RF-TEN-03 é **estratégico**. Se o inquilino não tem WhatsApp cadastrado, a cobrança automática não funciona. Esse campo deve ser tratado como obrigatório ou, no mínimo, o sistema deve alertar quando está vazio.

---

### Módulo: Contratos de Aluguel

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-CON-01 | O sistema deve permitir cadastrar contratos de aluguel vinculando: imóvel, proprietário, inquilino(s), valor do aluguel, dia de vencimento, data de início, data de fim | MVP |
| RF-CON-02 | O sistema deve registrar o status do contrato: ativo, encerrado, cancelado | MVP |
| RF-CON-03 | Um imóvel só pode ter um contrato ativo por vez | MVP |
| RF-CON-04 | O sistema deve permitir registrar reajustes de valor no contrato | MVP |
| RF-CON-05 | O sistema deve validar que a data de fim é posterior à data de início | MVP |
| RF-CON-06 | O sistema deve alertar quando um contrato está próximo do vencimento (ex: 60, 30, 15 dias) | Pós-MVP |
| RF-CON-07 | O sistema deve suportar contratos com múltiplos inquilinos (co-locatários) | Futuro |

**Regra de negócio importante:** O contrato é a peça central que conecta imóvel, proprietário e inquilino. Dele derivam as cobranças. Sem contrato, não há cobrança.

---

### 🔄 Módulo: Financeiro (Contas a Receber + Gateway de Pagamento)

> [!IMPORTANT]
> **MUDANÇA SIGNIFICATIVA:** O pagamento agora é **automático via gateway** (Pix, boleto, cartão) desde o MVP, não mais marcação manual.

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-FIN-01 | O sistema deve gerar automaticamente registros de cobrança mensal com base nos contratos ativos | MVP |
| RF-FIN-02 | Cada registro de cobrança deve conter: contrato de origem, valor, data de vencimento, status (pendente, pago, atrasado, cancelado) | MVP |
| RF-FIN-03 | 🔄 O sistema deve gerar **links de pagamento** para cada cobrança (Pix, boleto e cartão) via integração com gateway de pagamento | MVP |
| RF-FIN-04 | 🔄 O sistema deve registrar pagamentos **automaticamente** via webhook do gateway de pagamento quando o inquilino paga | MVP |
| RF-FIN-05 | O sistema deve calcular multa e juros por atraso conforme configuração da organização | MVP |
| RF-FIN-06 | 🔄 O sistema deve ter uma **página dedicada de configuração de multa e juros** acessível apenas por ADMIN e FINANCEIRO | MVP |
| RF-FIN-07 | O sistema deve manter histórico de todos os pagamentos | MVP |
| RF-FIN-08 | O sistema deve identificar automaticamente cobranças vencidas e não pagas (status → atrasado) | MVP |
| RF-FIN-09 | 🔄 O sistema deve suportar pagamento manual como fallback (funcionário marca como "pago" quando o pagamento ocorre fora do gateway) | MVP |
| RF-FIN-10 | 🔄 O sistema deve exibir o status do pagamento em tempo real (pendente, processando, pago, falhou) | MVP |

> [!WARNING]
> **Sobre a integração com gateway de pagamento:** Isso adiciona complexidade significativa ao MVP. Precisaremos escolher um gateway (Asaas, Mercado Pago, Stripe, PagBank, etc.) e implementar:
> - Geração de cobranças via API
> - Recebimento de webhooks para confirmação de pagamento
> - Geração de Pix QR Code
> - Emissão de boletos
> - Processamento de cartão de crédito
> - Gestão de split de pagamento (se aplicável — repasse ao proprietário)
>
> **Recomendação:** Asaas ou Mercado Pago são os mais simples para integrar no Brasil e suportam Pix + boleto + cartão.

---

### 🔄 Módulo: Configuração de Multa e Juros

> [!IMPORTANT]
> **NOVO MÓDULO.** Página dedicada de responsabilidade total da imobiliária.

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-MJ-01 | 🔄 O sistema deve ter uma página de configuração de multa e juros por organização | MVP |
| RF-MJ-02 | 🔄 A configuração deve incluir: percentual de multa por atraso, percentual de juros ao mês, dias de carência antes de aplicar multa | MVP |
| RF-MJ-03 | 🔄 Somente usuários com permissão `billing.configure` (ADMIN e FINANCEIRO por padrão) podem acessar esta página | MVP |
| RF-MJ-04 | 🔄 O sistema deve exibir um **aviso informativo** sobre os limites legais (Lei do Inquilinato: multa máx 2%, juros máx 1%/mês), mas **não impedir** que a imobiliária configure valores diferentes | MVP |
| RF-MJ-05 | 🔄 Toda alteração de configuração de multa/juros deve ser registrada no log de auditoria | MVP |
| RF-MJ-06 | 🔄 Os valores configurados devem ser aplicados automaticamente em todas as cobranças em atraso da organização | MVP |

> [!CAUTION]
> **A responsabilidade legal é da imobiliária.** O sistema mostra um aviso sobre os limites da Lei do Inquilinato (2% multa + 1% juros/mês), mas o dono da imobiliária tem livre arbítrio para configurar os valores. O sistema registra tudo no log de auditoria para transparência.

---

### Módulo: Inadimplência

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-INAD-01 | O sistema deve classificar automaticamente um inquilino como inadimplente quando tiver cobranças em atraso | MVP |
| RF-INAD-02 | O sistema deve exibir uma lista de todos os inadimplentes com: nome, imóvel, valor total em atraso, dias de atraso, última cobrança enviada | MVP |
| RF-INAD-03 | O sistema deve calcular o valor total em atraso por inquilino (incluindo multa e juros) | MVP |
| RF-INAD-04 | O sistema deve manter um histórico de inadimplência por inquilino | MVP |
| RF-INAD-05 | O sistema deve permitir filtrar inadimplentes por faixa de atraso (1-15 dias, 16-30, 31-60, 60+) | MVP |
| RF-INAD-06 | O sistema deve gerar indicadores: taxa de inadimplência, valor total em atraso, evolução mês a mês | Pós-MVP |

---

### 🔄 Módulo: Cobranças (Comunicação) — 3 Modos de Operação

> [!IMPORTANT]
> **MUDANÇA SIGNIFICATIVA:** O sistema agora suporta **3 modos de cobrança** configuráveis pela organização, em vez de apenas aprovação manual.

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-COB-01 | O sistema deve permitir enviar mensagem de cobrança via WhatsApp para um inquilino inadimplente | MVP |
| RF-COB-02 | O sistema deve registrar cada cobrança enviada: data, canal, mensagem, status do envio | MVP |
| RF-COB-03 | O sistema deve impedir envio de cobrança duplicada no mesmo dia para o mesmo inquilino | MVP |
| RF-COB-04 | 🔄 O sistema deve suportar **3 modos de cobrança** configuráveis por organização | MVP |
| RF-COB-05 | O sistema deve registrar falhas de envio e permitir reenvio | MVP |
| RF-COB-06 | O sistema deve usar templates de mensagem configuráveis | MVP |
| RF-COB-07 | O sistema deve permitir envio em lote (selecionar múltiplos inadimplentes e disparar) | Pós-MVP |
| RF-COB-08 | 🔄 O sistema deve implementar uma régua de cobrança configurável (ex: 1 dia → lembrete, 5 dias → cobrança, 15 dias → aviso formal) que funciona nos modos 2 e 3 | MVP |
| RF-COB-09 | O sistema deve usar IA para personalizar mensagens com base no perfil do inquilino | Futuro |

#### 🔄 Os 3 Modos de Cobrança

| Modo | Nome | Comportamento | Quando usar |
|------|------|--------------|-------------|
| **1** | 🔴 Desativado | Cobrança automática totalmente **desligada**. O sistema identifica inadimplentes mas NÃO envia mensagens. O funcionário deve entrar na lista de inadimplentes e enviar manualmente, uma a uma. | Imobiliárias que preferem controle total e contato pessoal |
| **2** | 🟡 Supervisionado | O sistema identifica inadimplentes, monta as mensagens usando a régua de cobrança, mas **NÃO envia automaticamente**. As mensagens ficam em uma fila de aprovação. O funcionário designado revisa e aprova/rejeita cada envio. | Equilíbrio entre automação e controle humano |
| **3** | 🟢 Autônomo | O sistema identifica inadimplentes, monta as mensagens e **envia automaticamente** seguindo a régua de cobrança, sem intervenção humana. O funcionário pode visualizar o histórico de envios e intervir se necessário. | Imobiliárias com alto volume que confiam na automação |

```
MODO 1 (Desativado):
  Sistema identifica inadimplentes → Exibe lista → Funcionário envia manualmente

MODO 2 (Supervisionado):
  Sistema identifica inadimplentes → Monta mensagens → Fila de aprovação → Funcionário aprova → Sistema envia

MODO 3 (Autônomo):
  Sistema identifica inadimplentes → Monta mensagens → Sistema envia automaticamente → Registra histórico
```

> [!NOTE]
> - O modo padrão ao cadastrar uma organização é o **Modo 2 (Supervisionado)** — equilíbrio seguro.
> - A troca de modo deve ser restrita ao ADMIN e a quem tiver permissão `collections.configure`.
> - A troca de modo é registrada no log de auditoria.
> - Mesmo no Modo 3 (Autônomo), o sistema respeita a regra de não enviar cobranças duplicadas no mesmo dia (RF-COB-03).

---

### Módulo: Dashboard

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-DASH-01 | O dashboard deve exibir: total a receber no mês, total recebido, total em atraso | MVP |
| RF-DASH-02 | O dashboard deve exibir a quantidade de contratos ativos | MVP |
| RF-DASH-03 | O dashboard deve exibir a lista dos maiores inadimplentes | MVP |
| RF-DASH-04 | O dashboard deve exibir a taxa de inadimplência do mês | MVP |
| RF-DASH-05 | O dashboard deve exibir cobranças enviadas vs. pagas nos últimos 30 dias | MVP |
| RF-DASH-06 | O dashboard deve permitir filtro por período | Pós-MVP |
| RF-DASH-07 | O dashboard deve exibir gráfico de evolução da inadimplência | Pós-MVP |

---

### Módulo: Logs e Auditoria

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-LOG-01 | O sistema deve registrar toda ação de criação, edição e exclusão de registros | MVP |
| RF-LOG-02 | Cada log deve conter: usuário, ação, entidade afetada, data/hora, dados anteriores e posteriores | MVP |
| RF-LOG-03 | O log não pode ser editado ou excluído por nenhum usuário | MVP |
| RF-LOG-04 | O sistema deve permitir consultar logs por entidade, usuário ou período | MVP |
| RF-LOG-05 | O sistema deve registrar todas as tentativas de login (sucesso e falha) | MVP |

---

## Requisitos Não Funcionais

Estes definem **como** o sistema deve se comportar, não **o que** ele faz.

---

### Performance

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-PERF-01 | Endpoints da API devem responder em menos de 500ms (p95) para operações simples | Obrigatório |
| RNF-PERF-02 | O dashboard deve carregar em menos de 2 segundos | Obrigatório |
| RNF-PERF-03 | O sistema deve suportar pelo menos 50 usuários simultâneos sem degradação | Obrigatório |
| RNF-PERF-04 | Queries ao banco devem ser otimizadas com índices apropriados | Obrigatório |

---

### Segurança

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-SEC-01 | Senhas devem ser armazenadas com hash bcrypt ou argon2 (nunca em texto puro) | Obrigatório |
| RNF-SEC-02 | Toda comunicação deve usar HTTPS em produção | Obrigatório |
| RNF-SEC-03 | Tokens JWT devem ter tempo de expiração curto (15 minutos para access token) | Obrigatório |
| RNF-SEC-04 | O sistema deve implementar rate limiting em endpoints públicos | Obrigatório |
| RNF-SEC-05 | Toda entrada do usuário deve ser validada e sanitizada | Obrigatório |
| RNF-SEC-06 | O sistema deve implementar CORS restritivo (apenas origens permitidas) | Obrigatório |
| RNF-SEC-07 | Secrets e credenciais nunca devem estar no código-fonte | Obrigatório |
| RNF-SEC-08 | O banco PostgreSQL não deve ser acessível externamente (apenas via rede Docker interna) | Obrigatório |
| RNF-SEC-09 | Headers de segurança HTTP devem estar configurados (X-Frame-Options, CSP, etc.) | Recomendado |
| RNF-SEC-10 | O sistema deve implementar proteção contra CSRF em operações sensíveis | Recomendado |

---

### Disponibilidade

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-DISP-01 | O sistema deve ter uptime de pelo menos 99% (aceita ~7h de downtime por mês) | Obrigatório |
| RNF-DISP-02 | O sistema deve ter backup diário automatizado do banco de dados | Obrigatório |
| RNF-DISP-03 | O deploy não deve causar mais de 2 minutos de indisponibilidade | Recomendado |

---

### Escalabilidade

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-ESC-01 | A arquitetura deve suportar crescimento de 1 para 100 organizações sem refatoração arquitetural | Obrigatório |
| RNF-ESC-02 | O banco deve suportar pelo menos 100.000 registros de cobrança sem degradação significativa | Obrigatório |
| RNF-ESC-03 | O sistema deve poder migrar de uma VPS para uma infraestrutura maior sem reconstrução | Recomendado |

---

### Manutenibilidade

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-MAN-01 | O código deve seguir padrões consistentes (linting, formatação) | Obrigatório |
| RNF-MAN-02 | Módulos devem ser independentes (alterar financeiro não quebra cadastros) | Obrigatório |
| RNF-MAN-03 | O sistema deve ter documentação básica de API (Swagger/OpenAPI) | Recomendado |
| RNF-MAN-04 | Testes automatizados devem cobrir pelo menos regras de negócio críticas | Recomendado |

---

### Usabilidade

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-USA-01 | A interface deve ser responsiva (funcionar em desktop e tablet) | Obrigatório |
| RNF-USA-02 | Ações destrutivas devem exigir confirmação | Obrigatório |
| RNF-USA-03 | O sistema deve fornecer feedback visual para ações (loading, sucesso, erro) | Obrigatório |
| RNF-USA-04 | O sistema deve ser acessível em navegadores modernos (Chrome, Firefox, Edge, Safari) | Obrigatório |

---

### Conformidade Legal

| ID | Requisito | Classificação |
|----|-----------|--------------|
| RNF-LEG-01 | O sistema deve estar em conformidade com a LGPD (Lei Geral de Proteção de Dados) | Obrigatório |
| RNF-LEG-02 | Dados pessoais (CPF, telefone, endereço) devem ser tratados como dados sensíveis | Obrigatório |
| RNF-LEG-03 | O sistema deve permitir exportação/exclusão de dados pessoais a pedido do titular | Pode ser implementado posteriormente |
| RNF-LEG-04 | O sistema deve informar ao usuário quais dados são coletados e para qual finalidade | Pode ser implementado posteriormente |

> [!WARNING]
> **LGPD não é opcional.** Ela se aplica a qualquer sistema que trate dados pessoais no Brasil. A base de segurança entra desde o dia 1.

---

## Regras de Negócio Críticas

Estas são regras do **domínio imobiliário** que o sistema precisa respeitar:

| ID | Regra | Impacto |
|----|-------|---------|
| RN-01 | Um imóvel só pode ter um contrato ativo por vez | Evita duplicidade de cobranças |
| RN-02 | Cobranças são geradas automaticamente todo mês com base nos contratos ativos | Motor do sistema financeiro |
| RN-03 | 🔄 Multa e juros são configuráveis pela imobiliária. O sistema exibe aviso sobre limites legais (2% multa + 1% juros/mês) mas não impede configuração diferente | Responsabilidade da imobiliária |
| RN-04 | Uma cobrança cancelada não pode ser reativada (deve-se criar uma nova) | Integridade do histórico |
| RN-05 | O valor pago pode ser diferente do valor cobrado (pagamento parcial deve ser registrado) | Realidade operacional |
| RN-06 | Ao encerrar um contrato, cobranças pendentes devem permanecer no sistema (não são deletadas) | Histórico financeiro |
| RN-07 | O sistema não pode enviar cobranças para contratos inativos | Evita envios indevidos |
| RN-08 | 🔄 Pagamentos são registrados automaticamente via webhook do gateway, com opção de registro manual como fallback | Automação financeira |

---

## 🔄 Registro de Decisões do Jonnathan (30/08/2026)

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Pagamento manual no MVP? | **NÃO.** Pagamento deve ser automático via gateway: Pix, boleto e cartão desde o MVP |
| 2 | Roles fixas são suficientes? | **NÃO.** O dono deve poder criar, editar e excluir roles com permissões granulares |
| 3 | Limitar multa/juros por lei? | **NÃO impedir.** Página dedicada de configuração com aviso legal, mas responsabilidade é da imobiliária |
| 4 | Aprovação manual de cobranças? | **3 MODOS:** (1) Desativado, (2) Supervisionado com aprovação, (3) Totalmente autônomo |
| 5 | Funcionalidades faltando? | Nenhuma por enquanto. Revisitar no futuro |
| 6 | Dashboard suficiente? | Sim. Revisitar no futuro se necessário |

