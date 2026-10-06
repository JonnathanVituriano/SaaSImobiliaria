import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OwnersService } from './owners.service.js';
import { CreateOwnerDto } from './dto/create-owner.dto.js';
import { UpdateOwnerDto } from './dto/update-owner.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('owners')
export class OwnersController {
  constructor(private readonly service: OwnersService) {}

  @Post()
  @RequirePermissions('owners.create')
  create(@Body() createDto: CreateOwnerDto) {
    return this.service.create(createDto);
  }

  @Get()
  @RequirePermissions('owners.read')
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('owners.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('owners.update')
  update(@Param('id') id: string, @Body() updateDto: UpdateOwnerDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('owners.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}