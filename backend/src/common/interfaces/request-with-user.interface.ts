/**
 * Interface que estende o Request do Express com os dados do usuário autenticado.
 *
 * Após o JwtAuthGuard validar o token, o objeto `user` é injetado no request
 * com os dados decodificados do JWT payload.
 */
export interface RequestWithUser extends Request {
  user: {
    /** UUID do usuário */
    sub: string;
    /** UUID da organização (imobiliária) */
    org: string;
    /** UUID da role */
    role: string;
    /** Lista de códigos de permissão: ['properties.create', 'billing.manage', ...] */
    permissions: string[];
  };
  /** UUID da organização — injetado pelo TenantInterceptor */
  organizationId: string;
}

