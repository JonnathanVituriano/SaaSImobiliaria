import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // Verifica se a rota pode ser acessada (retorna true = pode, false ou throw = bloqueado)
  canActivate(context: ExecutionContext) {
    // Busca se existe o @Public() no método ou na classe
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se for público, não exige token
    if (isPublic) {
      return true;
    }

    // Se não, delega para a lógica normal do PassportJWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Se ocorrer algum erro ou o usuário não foi injetado (token inválido/inexistente)
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou não fornecido');
    }
    return user;
  }
}

