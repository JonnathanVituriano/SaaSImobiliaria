import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';
import { UpdateTenantDto } from './dto/update-tenant.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Post()
  @RequirePermissions('tenants.create')
  create(@Body() createDto: CreateTenantDto) {
    return this.service.create(createDto);
  }

  @Get()
  @RequirePermissions('tenants.read')
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('tenants.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('tenants.update')
  update(@Param('id') id: string, @Body() updateDto: UpdateTenantDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('tenants.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}