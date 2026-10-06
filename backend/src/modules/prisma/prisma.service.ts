import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../../common/tenant/tenant.context.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // O cliente estendido que usaremos na aplicação
  public readonly extended: ReturnType<typeof this.getExtendedClient>;

  constructor() {
    super();
    this.extended = this.getExtendedClient();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private getExtendedClient() {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const orgId = tenantContext.getStore();

            // Lista de modelos que NÃO possuem organizationId ou são globais
            const globalModels = [
              'Organization',
              'OrganizationSettings',
              'Permission',
              'RolePermission',
              'RefreshToken',
              'ContractAdjustment',
            ];

            // Se tem um tenant ativo E o modelo pertence a um tenant
            if (orgId && !globalModels.includes(model)) {
              const anyArgs = args as any;

              // Operações de LEITURA que aceitam where livre
              // NOTA: NÃO incluímos findUnique, update e delete aqui pois eles exigem
              // campos de chave única no where, e nossos models não têm
              // @@unique([id, organizationId]). Para essas operações, os Services
              // devem usar findFirst + filtro manual, ou este client com filtro explícito.
              if (
                [
                  'findFirst',
                  'findMany',
                  'count',
                  'updateMany',
                  'deleteMany',
                  'aggregate',
                  'groupBy',
                ].includes(operation)
              ) {
                anyArgs.where = { ...anyArgs.where, organizationId: orgId };
              }

              // Injeta organizationId automaticamente nas criações (create)
              if (['create', 'createMany'].includes(operation)) {
                if (operation === 'create') {
                  anyArgs.data = { ...anyArgs.data, organizationId: orgId };
                } else if (operation === 'createMany' && Array.isArray(anyArgs.data)) {
                  anyArgs.data = anyArgs.data.map((item: any) => ({ ...item, organizationId: orgId }));
                }
              }
            }

            return query(args);
          },
        },
      },
    });
  }
}
