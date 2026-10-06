import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // TEMPLATES
  // ==========================================

  async createTemplate(dto: CreateTemplateDto) {
    return this.prisma.extended.collectionTemplate.create({
      data: dto as any,
    });
  }

  async findAllTemplates(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.collectionTemplate.findMany({
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.extended.collectionTemplate.count(),
    ]);

    return { data, meta: { total, page: pagination.page, limit: pagination.limit } };
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    return this.prisma.collectionTemplate.update({
      where: { id },
      data: dto as any,
    });
  }

  // ==========================================
  // MENSAGENS (Caixa de Saída)
  // ==========================================

  async findAllMessages(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.collectionMessage.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { name: true, whatsapp: true } },
          billing: { select: { amount: true, totalAmount: true, dueDate: true } },
        }
      }),
      this.prisma.extended.collectionMessage.count(),
    ]);

    return { data, meta: { total, page: pagination.page, limit: pagination.limit } };
  }

  /**
   * Método chamado pelo financeiro para aprovar mensagens geradas pelo robô (Modo 2).
   */
  async approveMessage(messageId: string, userId: string) {
    const message = await this.prisma.extended.collectionMessage.findFirst({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Mensagem não encontrada');
    
    if (message.status !== 'pending_approval') {
      throw new BadRequestException('Esta mensagem não está aguardando aprovação');
    }

    return this.prisma.collectionMessage.update({
      where: { id: messageId },
      data: {
        status: 'pending', // Sai de aprovação e vai pra fila de envio real
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });
  }
}

