import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { RegisterPaymentDto } from './dto/register-payment.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @RequirePermissions('billing.read')
  findAll(@Query() pagination: PaginationDto) {
    return this.billingService.findAll(pagination);
  }

  @Get(':id')
  @RequirePermissions('billing.read')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post(':id/payments')
  @RequirePermissions('billing.manage')
  registerPayment(
    @Param('id') id: string,
    @Body() dto: RegisterPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.billingService.registerPayment(id, dto, user.sub); // user.sub é o ID do funcionário logado
  }
}

