import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { RegisterPaymentDto } from './dto/register-payment.dto.js';
import { tenantContext } from '../../common/tenant/tenant.context.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todas as cobranças da imobiliária
   */
  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.billing.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { dueDate: 'desc' },
        include: {
          tenant: { select: { name: true, cpf: true } },
          contract: { select: { property: { select: { addressStreet: true, addressNumber: true } } } },
        },
      }),
      this.prisma.extended.billing.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Busca detalhes de uma cobrança específica com histórico de pagamentos
   */
  async findOne(id: string) {
    const billing = await this.prisma.extended.billing.findFirst({
      where: { id },
      include: {
        tenant: true,
        contract: true,
        payments: true, // Traz os pagamentos atrelados
      },
    });

    if (!billing) throw new NotFoundException('Fatura não encontrada');
    return billing;
  }

  /**
   * Atualiza os juros e multas de uma cobrança específica baseada na configuração da Imobiliária
   * Este método pode ser chamado via CRON ou quando alguém visualiza a fatura.
   */
  async calculateOverdueCharges(billingId: string, orgId: string) {
    // Como isto pode ser chamado fora de um Request HTTP (ex: CronJob), precisamos usar
    // o Prisma de forma direta injetando o orgId.
    const billing = await this.prisma.billing.findFirst({
      where: { id: billingId, organizationId: orgId },
    });

    if (!billing || billing.status === 'paid' || billing.status === 'cancelled') {
      return billing;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(billing.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    // Se ainda não venceu, retorna a própria fatura
    if (today <= dueDate) return billing;

    // Se venceu, busca configurações da imobiliária para saber % de multa e juros
    const settings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings) return billing;

    // Verifica período de carência (ex: multa só após 3 dias)
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= settings.gracePeriodDays) return billing;

    // Cálculo da Multa Fixa (% sobre o total)
    const penaltyAmount = Number(billing.amount) * (Number(settings.penaltyPercentage) / 100);
    
    // Cálculo dos Juros (Ao mês, proporcional ao dia)
    const interestPerMonth = Number(settings.interestPercentage) / 100;
    const interestPerDay = interestPerMonth / 30;
    const interestAmount = Number(billing.amount) * (interestPerDay * diffDays);

    const totalAmount = Number(billing.amount) + penaltyAmount + interestAmount;

    // Atualiza no banco!
    return this.prisma.billing.update({
      where: { id: billingId } as any,
      data: {
        penaltyAmount,
        interestAmount,
        totalAmount,
        status: 'overdue',
      } as any,
    });
  }

  /**
   * Baixa manual de uma fatura
   */
  async registerPayment(billingId: string, dto: RegisterPaymentDto, userId: string) {
    const orgId = tenantContext.getStore();
    const billing = await this.findOne(billingId); // Verifica se existe pro tenant

    if (billing.status === 'paid') {
      throw new BadRequestException('Fatura já está totalmente paga.');
    }

    // Cria o pagamento
    const payment = await this.prisma.extended.payment.create({
      data: {
        billingId: billing.id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentDate: new Date(dto.paymentDate),
        registeredBy: userId,
        notes: dto.notes,
      } as any,
    });

    // Se o valor pago cobrir o total da fatura, marca como 'paid', senão 'partially_paid'
    // Na vida real você pode ter pagamentos parciais, mas para MVP vamos somar.
    const allPayments = await this.prisma.extended.payment.findMany({
      where: { billingId: billing.id } as any,
    });

    const totalPaid = allPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    let newStatus = billing.status;
    if (totalPaid >= Number(billing.totalAmount)) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    await this.prisma.billing.update({
      where: { id: billing.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'paid' ? new Date() : null,
      } as any,
    });

    return payment;
  }
}

