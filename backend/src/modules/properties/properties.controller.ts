import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-propertie.dto.js';
import { UpdatePropertyDto } from './dto/update-propertie.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Post()
  @RequirePermissions('properties.create')
  create(@Body() createDto: CreatePropertyDto) {
    return this.service.create(createDto);
  }

  @Get()
  @RequirePermissions('properties.read')
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('properties.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('properties.update')
  update(@Param('id') id: string, @Body() updateDto: UpdatePropertyDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('properties.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}