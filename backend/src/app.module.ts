import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { OwnersModule } from './modules/owners/owners.module.js';
import { PropertiesModule } from './modules/properties/properties.module.js';
import { TenantsModule } from './modules/tenants/tenants.module.js';
import { ContractsModule } from './modules/contracts/contracts.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { CollectionsModule } from './modules/collections/collections.module.js';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor.js';

@Module({
  imports: [
    // Carrega variáveis de ambiente do .env
    ConfigModule.forRoot({
      isGlobal: true,  // Disponível em todos os módulos
    }),
    
    // Habilita CRON jobs
    ScheduleModule.forRoot(),

    // Banco de dados (Prisma)
    PrismaModule,
    
    AuthModule,
    OwnersModule,
    PropertiesModule,
    TenantsModule,
    ContractsModule,
    BillingModule,
    CollectionsModule,
    WhatsappModule,
    DashboardModule,

    // Os módulos de negócio serão adicionados conforme construímos:
    // OrganizationsModule,
    // UsersModule,
    // RolesModule,
    // DelinquencyModule,
    // CollectionsModule,
    // WhatsappModule,
    // SettingsModule,
    // DashboardModule,
    // AuditLogModule,
  ],
  controllers: [],
  providers: [
    // Torna a proteção JWT Global!
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Verifica as permissões (@RequirePermissions) Globalmente!
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    // Injeta o Tenant (organizationId) Globalmente!
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    }
  ],
})
export class AppModule {}
