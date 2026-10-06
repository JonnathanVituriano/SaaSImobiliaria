import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePropertyDto } from './dto/create-propertie.dto.js';
import { UpdatePropertyDto } from './dto/update-propertie.dto.js';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto.js';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePropertyDto) {
    return this.prisma.extended.property.create({
      data: createDto as any,
    });
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.property.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.property.count(),
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
    const item = await this.prisma.extended.property.findFirst({
      where: { id },
    });
    if (!item) throw new NotFoundException('Registro não encontrado');
    return item;
  }

  async update(id: string, updateDto: UpdatePropertyDto) {
    await this.findOne(id); // Garante que existe (e que é do tenant atual)
    return this.prisma.property.update({
      where: { id },
      data: updateDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Deleção lógica
    return this.prisma.property.update({
      where: { id },
      data: { isActive: false },
    });
  }
}