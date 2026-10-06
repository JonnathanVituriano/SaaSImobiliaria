import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CollectionsCron {
  private readonly logger = new Logger(CollectionsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Roda todos os dias de manhã, após a rotina de Billing.
   * Ele varre faturas pendentes, avalia templates e enfileira mensagens.
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async evaluateCollectionRules() {
    this.logger.log('Iniciando Régua de Cobranças...');

    // Pega todas as faturas não pagas
    const pendingBillings = await this.prisma.billing.findMany({
      where: { status: { in: ['pending', 'overdue', 'partially_paid'] } },
      include: {
        tenant: true,
        contract: { include: { property: true } },
        organization: { include: { settings: true } }, // Pegar as regras da Org
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const billing of pendingBillings) {
      try {
        const orgSettings = billing.organization.settings;
        if (!orgSettings || orgSettings.collectionMode === 1) {
          // Modo 1 = Desativado. Imobiliária não quer que enviemos nada.
          continue;
        }

        const dueDate = new Date(billing.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Diferença em dias (- significa vencimento futuro, + significa dias de atraso)
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Busca o template ideal para este número de dias (daquela organização)
        const templates = await this.prisma.collectionTemplate.findMany({
          where: {
            organizationId: billing.organizationId,
            isActive: true,
            daysOverdueMin: { lte: diffDays },
            daysOverdueMax: { gte: diffDays },
          },
        });

        // Pegamos o primeiro que der match (caso haja sobreposição)
        const matchingTemplate = templates[0];
        
        if (matchingTemplate) {
          // Já enviamos essa exata mensagem para essa fatura? (Para não spammar)
          const alreadyGenerated = await this.prisma.collectionMessage.findFirst({
            where: {
              billingId: billing.id,
              templateId: matchingTemplate.id,
            },
          });

          if (!alreadyGenerated) {
            // Personaliza a mensagem
            let body = matchingTemplate.messageBody;
            body = body.replaceAll('{{nome}}', billing.tenant.name);
            body = body.replaceAll('{{valor}}', `R$ ${Number(billing.totalAmount).toFixed(2)}`);
            body = body.replaceAll('{{imovel}}', billing.contract.property.addressStreet);

            // Se Modo 2 (Supervisionado) => pending_approval
            // Se Modo 3 (Autônomo) => pending (Pronto pra envio)
            const status = orgSettings.collectionMode === 2 ? 'pending_approval' : 'pending';

            await this.prisma.collectionMessage.create({
              data: {
                organizationId: billing.organizationId,
                billingId: billing.id,
                tenantId: billing.tenantId,
                templateId: matchingTemplate.id,
                messageBody: body,
                channel: 'whatsapp',
                status: status,
              },
            });

            this.logger.log(`Mensagem de cobrança (Status: ${status}) gerada para a fatura ${billing.id}`);
          }
        }
      } catch (err: any) {
        this.logger.error(`Erro ao processar régua para fatura ${billing.id}: `, err.message);
      }
    }
    
    this.logger.log('Régua de cobranças finalizada.');
  }
}

