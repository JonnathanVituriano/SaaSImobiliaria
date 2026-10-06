import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions('dashboard.read') // Permissão específica de diretoria/gerência
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
