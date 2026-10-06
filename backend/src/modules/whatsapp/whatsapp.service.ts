import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly GRAPH_API_VERSION = 'v19.0';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * CRON que roda a cada 10 minutos procurando mensagens pendentes.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async dispatchPendingMessages() {
    this.logger.log('Iniciando disparos para o WhatsApp...');

    // Busca todas as mensagens na fila
    const messages = await this.prisma.collectionMessage.findMany({
      where: { status: 'pending' },
      include: {
        tenant: true,
        organization: { include: { settings: true } },
      },
      take: 50, // Lote de 50 para não engasgar
    });

    for (const msg of messages) {
      try {
        const settings = msg.organization.settings;

        // Se a imobiliária não configurou o WhatsApp, marcamos como falha
        if (!settings || !settings.whatsappPhoneNumberId || !settings.whatsappApiToken) {
          await this.markAsFailed(msg.id, 'Imobiliária não possui WhatsApp configurado.');
          continue;
        }

        const phone = msg.tenant.whatsapp.replace(/[^0-9]/g, ''); // Limpa caracteres não numéricos

        // Monta a requisição para a API do Meta
        // Documentação oficial: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
        const url = `https://graph.facebook.com/${this.GRAPH_API_VERSION}/${settings.whatsappPhoneNumberId}/messages`;
        
        const payload = {
          messaging_product: 'whatsapp',
          to: `55${phone}`, // Assumindo Brasil (55)
          type: 'text',
          text: {
            preview_url: false,
            body: msg.messageBody,
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.whatsappApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.messages && data.messages.length > 0) {
          // Sucesso! O Meta nos devolve o ID oficial da mensagem
          const waId = data.messages[0].id;
          
          await this.prisma.collectionMessage.update({
            where: { id: msg.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              whatsappMessageId: waId,
            },
          });
          this.logger.log(`Mensagem ${msg.id} enviada com sucesso pro Inquilino ${msg.tenantId}`);
        } else {
          // A API retornou erro (ex: número não tem WhatsApp, token expirado)
          await this.markAsFailed(msg.id, data.error?.message || 'Erro desconhecido API Meta');
        }

      } catch (err: any) {
        await this.markAsFailed(msg.id, err.message);
      }
    }
  }

  private async markAsFailed(id: string, reason: string) {
    this.logger.error(`Falha ao enviar mensagem ${id}: ${reason}`);
    await this.prisma.collectionMessage.update({
      where: { id },
      data: {
        status: 'failed',
        errorMessage: reason,
      },
    });
  }

  /**
   * Processa o Webhook recebido do Meta.
   * O Meta nos manda eventos dizendo se a mensagem foi 'delivered', 'read' ou 'failed'.
   */
  async processWebhookEvent(body: any) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.statuses) {
        for (const status of value.statuses) {
          const waId = status.id;
          const statusType = status.status; // 'delivered', 'read', 'failed'

          const message = await this.prisma.collectionMessage.findFirst({
            where: { whatsappMessageId: waId },
          });

          if (message) {
            const updateData: any = { status: statusType };
            if (statusType === 'delivered') updateData.deliveredAt = new Date(status.timestamp * 1000);
            if (statusType === 'read') updateData.readAt = new Date(status.timestamp * 1000);

            await this.prisma.collectionMessage.update({
              where: { id: message.id },
              data: updateData,
            });
            
            this.logger.log(`Status da mensagem ${message.id} atualizado para ${statusType}`);
          }
        }
      }
      
      // Opcional: Se 'value.messages' existir, é o Inquilino respondendo. 
      // (Poderíamos salvar isso no banco para a Imobiliária responder depois).
      
    } catch (err: any) {
      this.logger.error('Erro ao processar Webhook do WhatsApp:', err.message);
    }
  }
}
