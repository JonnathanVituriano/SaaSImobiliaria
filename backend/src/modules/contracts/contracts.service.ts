import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateContractDto) {
    // Para criar um contrato, vamos garantir que o imóvel está "disponível"
    const property = await this.prisma.extended.property.findFirst({
      where: { id: createDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }
    
    if (property.status !== 'available') {
      throw new BadRequestException('O imóvel precisa estar com status "available" para um novo contrato');
    }

    // Criamos o contrato e já passamos as strings de data para objetos Date
    const contract = await this.prisma.extended.contract.create({
      data: {
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
      } as any,
    });

    // Mudar status do imóvel para alugado
    await this.prisma.property.update({
      where: { id: property.id },
      data: { status: 'rented' },
    });

    return contract;
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.contract.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        // Incluindo dados básicos das amarrações para a lista ficar rica
        include: {
          tenant: { select: { id: true, name: true, cpf: true } },
          property: { select: { id: true, addressStreet: true, addressNumber: true } },
        }
      }),
      this.prisma.extended.contract.count(),
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

  async findOne(id: string) {
    const item = await this.prisma.extended.contract.findFirst({
      where: { id },
      include: {
        tenant: true,
        owner: true,
        property: true,
      }
    });
    if (!item) throw new NotFoundException('Contrato não encontrado');
    return item;
  }

  async update(id: string, updateDto: UpdateContractDto) {
    await this.findOne(id);

    const updateData: any = { ...updateDto };
    
    // Converter datas se foram enviadas
    if (updateDto.startDate) updateData.startDate = new Date(updateDto.startDate);
    if (updateDto.endDate) updateData.endDate = new Date(updateDto.endDate);

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
    });
  }

  async terminate(id: string) {
    const contract = await this.findOne(id);
    
    // Terminar o contrato (status = terminated)
    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: { status: 'terminated' } as any,
    });

    // Liberar o imóvel (status = available)
    await this.prisma.property.update({
      where: { id: contract.propertyId },
      data: { status: 'available' } as any,
    });

    return updatedContract;
  }
}

