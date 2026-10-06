import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { RequestWithUser } from '../interfaces/request-with-user.interface.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca quais permissões a rota exige
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não exigir nenhuma permissão específica, está liberado (desde que logado)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user || !user.permissions) {
      throw new ForbiddenException('Acesso negado. Usuário sem permissões.');
    }

    // Verifica se o usuário tem ALGUMA das permissões exigidas
    // O ADMIN (geralmente) possui todas as permissões cadastradas
    const hasPermission = requiredPermissions.some((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acesso negado. Requer uma destas permissões: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

