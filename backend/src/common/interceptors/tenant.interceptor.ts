import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../tenant/tenant.context.js';
import { RequestWithUser } from '../interfaces/request-with-user.interface.js';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    // O usuário foi injetado pelo JwtAuthGuard
    const user = request.user;

    // Se existe usuário logado e ele pertence a uma organização
    if (user && user.org) {
      request.organizationId = user.org;
      
      // Executa o resto da requisição DENTRO do contexto do tenant
      return tenantContext.run(user.org, () => {
        return next.handle();
      });
    }

    // Se for rota pública (sem usuário), segue normal sem tenant
    return next.handle();
  }
}

