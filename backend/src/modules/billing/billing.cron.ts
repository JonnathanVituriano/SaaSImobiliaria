import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { BillingService } from './billing.service.js';

@Injectable()
export class BillingCron {
  private readonly logger = new Logger(BillingCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  /**
   * Roda todos os dias às 01:00 da manhã
   * - Gera novas faturas se houver
   * - Atualiza juros/multas das atrasadas
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyBillingTasks() {
    this.logger.log('Iniciando rotina diária de cobranças...');
    await this.generateNewBillings();
    await this.updateOverdueBillings();
    this.logger.log('Rotina diária finalizada.');
  }

  private async generateNewBillings() {
    this.logger.log('Verificando novos contratos para gerar faturas...');
    
    // Como é um CRON, não tem "organizationId" na requisição.
    // Usamos o Prisma normal e buscamos os contratos ativos do sistema inteiro!
    const activeContracts = await this.prisma.contract.findMany({
      where: { status: 'active' },
    });

    const today = new Date();
    // Vamos gerar para o "mês atual"
    const referenceMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (const contract of activeContracts) {
      try {
        // Verifica se JÁ EXISTE fatura pra esse mês
        const exists = await this.prisma.billing.findUnique({
          where: {
            contractId_referenceMonth: {
              contractId: contract.id,
              referenceMonth: referenceMonth,
            },
          },
        });

        if (!exists) {
          // Corrige overflow: se dueDay=31 em meses com menos dias, usa o último dia do mês
          const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const safeDay = Math.min(contract.dueDay, lastDayOfMonth);
          let dueDate = new Date(today.getFullYear(), today.getMonth(), safeDay);
          
          // Se o dueDay já passou esse mês (ex: hoje é dia 15 e dueDay é 10),
          // para os contratos antigos, ele gera pro mês seguinte? 
          // Para MVP: O CRON gera sempre para o mês atual, não importa.
          // O ideal real seria rodar dia 20 para gerar o mês que vem. Mas para teste mantemos o atual.
          
          await this.prisma.billing.create({
            data: {
              organizationId: contract.organizationId,
              contractId: contract.id,
              tenantId: contract.tenantId,
              referenceMonth: referenceMonth,
              amount: contract.rentAmount,
              totalAmount: contract.rentAmount, // Inicia igual ao amount
              dueDate: dueDate,
              status: 'pending',
            },
          });
          this.logger.log(`Fatura gerada para contrato ${contract.id}`);
        }
      } catch (err: any) {
        this.logger.error(`Erro ao gerar fatura para ${contract.id}: `, err.message);
      }
    }
  }

  private async updateOverdueBillings() {
    this.logger.log('Atualizando multas e juros das faturas vencidas...');

    const pendingBillings = await this.prisma.billing.findMany({
      where: {
        status: { in: ['pending', 'overdue', 'partially_paid'] },
        dueDate: { lt: new Date() }, // Vencidas
      },
    });

    for (const billing of pendingBillings) {
      try {
        await this.billingService.calculateOverdueCharges(billing.id, billing.organizationId);
      } catch (err: any) {
        this.logger.error(`Erro ao calcular encargos da fatura ${billing.id}: `, err.message);
      }
    }
  }
}
