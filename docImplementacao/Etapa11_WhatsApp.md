# Etapa 11 — Integração Oficial do WhatsApp Cloud API

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. A automação completa do disparo das mensagens aprovadas foi feita, consumindo nativamente a API do Facebook (Meta) e lidando com Webhooks de retorno.

---

## O que foi feito

### 1. O Despachador de Mensagens (`WhatsappService.dispatchPendingMessages`) 🚀
- Roda de 10 em 10 minutos automaticamente.
- Busca o Inquilino. Usa regex `/[^0-9]/g` no Whatsapp dele para limpar traços ou parênteses, preparando para o Meta.
- Valida se a Imobiliária (Organization) cadastrou o seu próprio *Token* e *Phone Number ID* nas `OrganizationSettings`. Sem isso, o disparo falha avisando o motivo.
- Chama a API nativa do Meta (`POST https://graph.facebook.com/v19.0/`) usando a API nativa do `fetch` do Node.
- Se o Facebook retornar sucesso (junto com o ID longo deles `wamid.xxx`), salvamos o `whatsappMessageId` no nosso banco de dados. Precisamos desse ID salvo para saber qual mensagem foi lida/entregue depois.

### 2. O Webhook — Os "Ouvidos" do Robô (`WhatsappController`) 🎧
A Meta exige duas configurações para plugar nosso sistema neles:
1. **Verificação (`GET /whatsapp/webhook`)**: Onde a Meta nos envia uma senha temporária e um `challenge`, e nós retornamos esse `challenge` (provando que o endpoint é nosso).
2. **Recepção de Eventos (`POST /whatsapp/webhook`)**: Sempre que o inquilino receber a mensagem no celular dele (entregue), abrir a mensagem (lida), ou responder, a Meta bate neste nosso endpoint.
   - Nós identificamos o `whatsappMessageId` recebido pela Meta.
   - Procuramos esse ID no nosso banco `CollectionMessage`.
   - Se acharmos, marcamos a data de `deliveredAt` (Entregue) ou `readAt` (Lido), mudando o status no sistema.

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **Meta Graph API** | A API oficial do Facebook evoluiu muito desde que compraram o WhatsApp. Hoje não se usa bots piratas (Puppeteer/Z-API) em sistemas Enterprise; usa-se a Cloud API, que é oficial, super barata e não sofre banimento por desconexão do celular. |
| **Arquitetura Event-Driven (Webhooks)** | Nossa API não fica perguntando para a Meta "A mensagem foi entregue?". Isso é lento. Em vez disso, nós passamos a nossa URL para a Meta e dizemos "Me avise quando for entregue". Isso economiza 99% do tráfego. |

---

## Próximo passo

**Etapa 12: Módulo de Dashboard e Análise.** — Nossa última etapa funcional antes de fecharmos a API! Precisamos de endpoints que agrupem essas informações (Quanto temos para receber? Quantos contratos ativos?) para plotar gráficos no Frontend.

