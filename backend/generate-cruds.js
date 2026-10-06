import fs from 'fs';
import path from 'path';

const modules = [
  {
    name: 'owners',
    Name: 'Owners',
    Model: 'owner',
    Entity: 'Owner',
    permissions: {
      create: 'owners.create',
      read: 'owners.read',
      update: 'owners.update',
      delete: 'owners.delete'
    },
    dtoFields: `
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cpfCnpj: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() bankPixKey?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    `
  },
  {
    name: 'properties',
    Name: 'Properties',
    Model: 'property',
    Entity: 'Property',
    permissions: {
      create: 'properties.create',
      read: 'properties.read',
      update: 'properties.update',
      delete: 'properties.delete'
    },
    dtoFields: `
  @IsString() @IsNotEmpty() ownerId: string;
  @IsString() @IsNotEmpty() type: string; // casa, apartamento
  @IsString() @IsNotEmpty() addressStreet: string;
  @IsString() @IsOptional() addressNumber?: string;
  @IsString() @IsNotEmpty() addressCity: string;
  @IsString() @IsNotEmpty() addressState: string;
  @IsNumber() @IsOptional() areaSqm?: number;
  @IsString() @IsOptional() status?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    `
  },
  {
    name: 'tenants',
    Name: 'Tenants',
    Model: 'tenant',
    Entity: 'Tenant',
    permissions: {
      create: 'tenants.create',
      read: 'tenants.read',
      update: 'tenants.update',
      delete: 'tenants.delete'
    },
    dtoFields: `
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cpf: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsNotEmpty() whatsapp: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    `
  }
];

const basePath = path.join(process.cwd(), 'src', 'modules');

for (const mod of modules) {
  const modPath = path.join(basePath, mod.name);
  const dtoPath = path.join(modPath, 'dto');
  
  fs.mkdirSync(dtoPath, { recursive: true });

  // 1. Create DTO
  fs.writeFileSync(path.join(dtoPath, `create-${mod.name.slice(0, -1)}.dto.ts`), `
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class Create${mod.Entity}Dto {${mod.dtoFields}}
  `.trim());

  // 2. Update DTO
  fs.writeFileSync(path.join(dtoPath, `update-${mod.name.slice(0, -1)}.dto.ts`), `
import { PartialType } from '@nestjs/mapped-types';
import { Create${mod.Entity}Dto } from './create-${mod.name.slice(0, -1)}.dto.js';

export class Update${mod.Entity}Dto extends PartialType(Create${mod.Entity}Dto) {}
  `.trim());

  // 3. Service
  fs.writeFileSync(path.join(modPath, `${mod.name}.service.ts`), `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Create${mod.Entity}Dto } from './dto/create-${mod.name.slice(0, -1)}.dto.js';
import { Update${mod.Entity}Dto } from './dto/update-${mod.name.slice(0, -1)}.dto.js';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ${mod.Name}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: Create${mod.Entity}Dto) {
    return this.prisma.extended.${mod.Model}.create({
      data: createDto as any,
    });
  }

  async findAll(pagination: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.extended.${mod.Model}.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.${mod.Model}.count(),
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
    const item = await this.prisma.extended.${mod.Model}.findUnique({
      where: { id } as any,
    });
    if (!item) throw new NotFoundException('Registro não encontrado');
    return item;
  }

  async update(id: string, updateDto: Update${mod.Entity}Dto) {
    await this.findOne(id); // Garante que existe (e que é do tenant atual)
    return this.prisma.extended.${mod.Model}.update({
      where: { id } as any,
      data: updateDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Deleção lógica
    return this.prisma.extended.${mod.Model}.update({
      where: { id } as any,
      data: { isActive: false } as any,
    });
  }
}
  `.trim());

  // 4. Controller
  fs.writeFileSync(path.join(modPath, `${mod.name}.controller.ts`), `
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ${mod.Name}Service } from './${mod.name}.service.js';
import { Create${mod.Entity}Dto } from './dto/create-${mod.name.slice(0, -1)}.dto.js';
import { Update${mod.Entity}Dto } from './dto/update-${mod.name.slice(0, -1)}.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('${mod.name}')
export class ${mod.Name}Controller {
  constructor(private readonly service: ${mod.Name}Service) {}

  @Post()
  @RequirePermissions('${mod.permissions.create}')
  create(@Body() createDto: Create${mod.Entity}Dto) {
    return this.service.create(createDto);
  }

  @Get()
  @RequirePermissions('${mod.permissions.read}')
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('${mod.permissions.read}')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('${mod.permissions.update}')
  update(@Param('id') id: string, @Body() updateDto: Update${mod.Entity}Dto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('${mod.permissions.delete}')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
  `.trim());

  // 5. Module
  fs.writeFileSync(path.join(modPath, `${mod.name}.module.ts`), `
import { Module } from '@nestjs/common';
import { ${mod.Name}Service } from './${mod.name}.service.js';
import { ${mod.Name}Controller } from './${mod.name}.controller.js';

@Module({
  controllers: [${mod.Name}Controller],
  providers: [${mod.Name}Service],
})
export class ${mod.Name}Module {}
  `.trim());
}

console.log('Todos os CRUDs gerados com sucesso!');

