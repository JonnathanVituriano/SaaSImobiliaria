import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post()
  @RequirePermissions('contracts.create')
  create(@Body() createDto: CreateContractDto) {
    return this.service.create(createDto);
  }

  @Get()
  @RequirePermissions('contracts.read')
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('contracts.read')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('contracts.update')
  update(@Param('id') id: string, @Body() updateDto: UpdateContractDto) {
    return this.service.update(id, updateDto);
  }

  // Diferente dos outros, no contrato nós "Encerramos" (Terminate)
  @Delete(':id')
  @RequirePermissions('contracts.delete')
  remove(@Param('id') id: string) {
    return this.service.terminate(id);
  }
}

