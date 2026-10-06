import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto.js';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTenantDto) {
    return this.prisma.extended.tenant.create({
      data: createDto as any,
    });
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.tenant.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.tenant.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      }
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.extended.tenant.findFirst({
      where: { id },
    });
    if (!item) throw new NotFoundException('Registro não encontrado');
    return item;
  }

  async update(id: string, updateDto: UpdateTenantDto) {
    await this.findOne(id); // Garante que existe (e que é do tenant atual)
    return this.prisma.tenant.update({
      where: { id },
      data: updateDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Deleção lógica
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }
}