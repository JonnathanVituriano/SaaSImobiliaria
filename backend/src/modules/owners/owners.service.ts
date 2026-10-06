import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOwnerDto } from './dto/create-owner.dto.js';
import { UpdateOwnerDto } from './dto/update-owner.dto.js';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto.js';

@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateOwnerDto) {
    return this.prisma.extended.owner.create({
      data: createDto as any,
    });
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.owner.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.owner.count(),
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
    const item = await this.prisma.extended.owner.findFirst({
      where: { id },
    });
    if (!item) throw new NotFoundException('Registro não encontrado');
    return item;
  }

  async update(id: string, updateDto: UpdateOwnerDto) {
    await this.findOne(id); // Garante que existe (e que é do tenant atual)
    return this.prisma.owner.update({
      where: { id },
      data: updateDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Deleção lógica
    return this.prisma.owner.update({
      where: { id },
      data: { isActive: false },
    });
  }
}