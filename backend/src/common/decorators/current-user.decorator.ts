import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Puxa de forma fácil os dados do usuário autenticado no Controller:
 * Ex: findMe(@CurrentUser() user: any)
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

