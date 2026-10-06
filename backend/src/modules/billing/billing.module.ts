import { Module } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { BillingCron } from './billing.cron.js';

@Module({
  controllers: [BillingController],
  providers: [BillingService, BillingCron],
  exports: [BillingService], // Vamos exportar porque o Módulo de CronJobs precisará dele
})
export class BillingModule {}
