import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  // TEMPLATES

  @Post('templates')
  @RequirePermissions('collections.configure')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(dto);
  }

  @Get('templates')
  @RequirePermissions('collections.configure')
  findAllTemplates(@Query() pagination: PaginationDto) {
    return this.service.findAllTemplates(pagination);
  }

  @Patch('templates/:id')
  @RequirePermissions('collections.configure')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.updateTemplate(id, dto);
  }

  // MENSAGENS (Caixa de Saída)

  @Get('messages')
  @RequirePermissions('collections.read')
  findAllMessages(@Query() pagination: PaginationDto) {
    return this.service.findAllMessages(pagination);
  }

  @Post('messages/:id/approve')
  @RequirePermissions('collections.send')
  approveMessage(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.approveMessage(id, user.sub);
  }
}

