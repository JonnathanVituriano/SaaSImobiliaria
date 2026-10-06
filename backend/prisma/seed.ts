import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed: popula o banco com dados iniciais necessários para o sistema funcionar.
 *
 * O que é criado:
 * 1. Todas as permissões do sistema (tabela estática)
 * 2. Uma organização de exemplo (para dev)
 * 3. Roles padrão (ADMIN, FINANCEIRO, OPERACIONAL) para essa organização
 * 4. Um usuário super admin
 */
async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. PERMISSÕES DO SISTEMA
  // ============================================
  const permissionsData = [
    // Imóveis
    { code: 'properties.create', groupName: 'properties', description: 'Criar imóveis' },
    { code: 'properties.read', groupName: 'properties', description: 'Visualizar imóveis' },
    { code: 'properties.update', groupName: 'properties', description: 'Editar imóveis' },
    { code: 'properties.delete', groupName: 'properties', description: 'Desativar imóveis' },
    // Proprietários
    { code: 'owners.create', groupName: 'owners', description: 'Criar proprietários' },
    { code: 'owners.read', groupName: 'owners', description: 'Visualizar proprietários' },
    { code: 'owners.update', groupName: 'owners', description: 'Editar proprietários' },
    { code: 'owners.delete', groupName: 'owners', description: 'Desativar proprietários' },
    // Inquilinos
    { code: 'tenants.create', groupName: 'tenants', description: 'Criar inquilinos' },
    { code: 'tenants.read', groupName: 'tenants', description: 'Visualizar inquilinos' },
    { code: 'tenants.update', groupName: 'tenants', description: 'Editar inquilinos' },
    { code: 'tenants.delete', groupName: 'tenants', description: 'Desativar inquilinos' },
    // Contratos
    { code: 'contracts.create', groupName: 'contracts', description: 'Criar contratos' },
    { code: 'contracts.read', groupName: 'contracts', description: 'Visualizar contratos' },
    { code: 'contracts.update', groupName: 'contracts', description: 'Editar contratos' },
    { code: 'contracts.delete', groupName: 'contracts', description: 'Cancelar contratos' },
    // Financeiro
    { code: 'billing.read', groupName: 'billing', description: 'Visualizar cobranças e pagamentos' },
    { code: 'billing.manage', groupName: 'billing', description: 'Gerenciar cobranças e registrar pagamentos' },
    { code: 'billing.configure', groupName: 'billing', description: 'Configurar multa, juros e gateway' },
    // Cobranças (comunicação)
    { code: 'collections.read', groupName: 'collections', description: 'Visualizar mensagens de cobrança' },
    { code: 'collections.send', groupName: 'collections', description: 'Enviar e aprovar cobranças' },
    { code: 'collections.configure', groupName: 'collections', description: 'Configurar modo de cobrança e templates' },
    // Inadimplência
    { code: 'delinquency.read', groupName: 'delinquency', description: 'Visualizar inadimplentes' },
    { code: 'delinquency.manage', groupName: 'delinquency', description: 'Gerenciar inadimplência' },
    // Dashboard
    { code: 'dashboard.read', groupName: 'dashboard', description: 'Visualizar dashboard' },
    // Usuários
    { code: 'users.create', groupName: 'users', description: 'Criar usuários' },
    { code: 'users.read', groupName: 'users', description: 'Visualizar usuários' },
    { code: 'users.update', groupName: 'users', description: 'Editar usuários' },
    { code: 'users.delete', groupName: 'users', description: 'Desativar usuários' },
    // Roles
    { code: 'roles.create', groupName: 'roles', description: 'Criar papéis' },
    { code: 'roles.read', groupName: 'roles', description: 'Visualizar papéis' },
    { code: 'roles.update', groupName: 'roles', description: 'Editar papéis' },
    { code: 'roles.delete', groupName: 'roles', description: 'Excluir papéis' },
    // Logs
    { code: 'logs.read', groupName: 'logs', description: 'Visualizar logs de auditoria' },
    // Configurações
    { code: 'settings.read', groupName: 'settings', description: 'Visualizar configurações' },
    { code: 'settings.update', groupName: 'settings', description: 'Alterar configurações' },
  ];

  console.log(`  📋 Criando ${permissionsData.length} permissões...`);

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // ============================================
  // 2. ORGANIZAÇÃO DE EXEMPLO (dev)
  // ============================================
  console.log('  🏢 Criando organização de exemplo...');

  const org = await prisma.organization.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'Imobiliária Exemplo',
      cnpj: '00.000.000/0001-00',
      email: 'contato@imobiliariaexemplo.com.br',
      phone: '(11) 99999-0000',
      addressStreet: 'Rua Exemplo',
      addressNumber: '100',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01000-000',
    },
  });

  // Criar configurações da organização
  await prisma.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      penaltyPercentage: 2.00,
      interestPercentage: 1.00,
      gracePeriodDays: 0,
      collectionMode: 2, // Supervisionado
    },
  });

  // ============================================
  // 3. ROLES PADRÃO
  // ============================================
  console.log('  👤 Criando roles padrão...');

  const allPermissions = await prisma.permission.findMany();

  // ADMIN — todas as permissões
  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'ADMIN' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'ADMIN',
      description: 'Acesso total a todas as funcionalidades',
      isSystem: true,
    },
  });

  // Vincular todas as permissões ao ADMIN
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // FINANCEIRO
  const financeiroPerms = allPermissions.filter((p) =>
    ['billing', 'collections', 'delinquency', 'dashboard'].includes(p.groupName) ||
    ['tenants.read', 'contracts.read', 'properties.read', 'owners.read'].includes(p.code),
  );

  const financeiroRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'FINANCEIRO' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'FINANCEIRO',
      description: 'Gestão financeira, cobranças e inadimplência',
      isSystem: true,
    },
  });

  for (const perm of financeiroPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: financeiroRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: financeiroRole.id, permissionId: perm.id },
    });
  }

  // OPERACIONAL
  const operacionalPerms = allPermissions.filter((p) =>
    ['properties', 'owners', 'tenants', 'contracts'].includes(p.groupName) ||
    p.code === 'dashboard.read',
  );

  const operacionalRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'OPERACIONAL' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'OPERACIONAL',
      description: 'Cadastros de imóveis, proprietários, inquilinos e contratos',
      isSystem: true,
    },
  });

  for (const perm of operacionalPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: operacionalRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: operacionalRole.id, permissionId: perm.id },
    });
  }

  // ============================================
  // 4. SUPER ADMIN USER
  // ============================================
  console.log('  🔐 Criando usuário admin...');

  const passwordHash = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
    10,
  );

  await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: process.env.SUPER_ADMIN_EMAIL || 'admin@saasimobiliaria.com',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      roleId: adminRole.id,
      name: 'Administrador',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@saasimobiliaria.com',
      passwordHash,
      phone: '(11) 99999-0000',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('   📧 Email: admin@saasimobiliaria.com');
  console.log('   🔑 Senha: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

