import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { tenantContext } from '../../common/tenant/tenant.context.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    // Primeiro e último dia do Mês
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // O organizationId vem do contexto do tenant (injetado automaticamente
    // pelo extended client para findMany/count/aggregate)

    // 1. Contagens Básicas (Operacional)
    const [totalProperties, totalActiveContracts, totalTenants] = await Promise.all([
      this.prisma.extended.property.count({ where: { isActive: true } }),
      this.prisma.extended.contract.count({ where: { status: 'active' } }),
      this.prisma.extended.tenant.count({ where: { isActive: true } }),
    ]);

    // 2. Financeiro do Mês (Faturas com vencimento este mês)
    // Agora o aggregate é interceptado pelo tenant extension,
    // então filtra automaticamente por organizationId.

    // Total que a imobiliária PREVIA receber
    const expectedRevenue = await this.prisma.extended.billing.aggregate({
      _sum: { amount: true },
      where: {
        dueDate: { gte: firstDay, lte: lastDay },
        status: { not: 'cancelled' },
      },
    });

    // Total que a imobiliária REALMENTE já recebeu
    const receivedRevenue = await this.prisma.extended.billing.aggregate({
      _sum: { totalAmount: true },
      where: {
        dueDate: { gte: firstDay, lte: lastDay },
        status: 'paid',
      },
    });

    // 3. Inadimplência Geral (Atrasados, independente de ser deste mês ou não)
    const overdueAgg = await this.prisma.extended.billing.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: {
        status: 'overdue',
      },
    });

    // 4. Últimas movimentações de pagamento
    const recentPayments = await this.prisma.extended.payment.findMany({
      take: 5,
      orderBy: { paymentDate: 'desc' },
      include: {
        billing: { select: { tenant: { select: { name: true } } } },
      },
    });

    return {
      operational: {
        totalProperties,
        totalActiveContracts,
        totalTenants,
      },
      financial: {
        expectedMonthly: Number(expectedRevenue._sum.amount || 0),
        receivedMonthly: Number(receivedRevenue._sum.totalAmount || 0),
        overdueTotalAmount: Number(overdueAgg._sum.totalAmount || 0),
        overdueCount: overdueAgg._count.id || 0,
      },
      // Nome do mês atual para exibir no frontend
      currentMonth: today.toLocaleString('pt-BR', { month: 'long' }),
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.paymentMethod,
        date: p.paymentDate,
        tenant: p.billing?.tenant?.name || 'Desconhecido',
      })),
    };
  }
}
