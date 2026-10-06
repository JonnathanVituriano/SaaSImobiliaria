import { SetMetadata } from '@nestjs/common';

// Essa chave pode ser qualquer string
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Este Decorator marca uma rota como Pública.
 * Quando o JwtAuthGuard vir isto, ele não exigirá o Access Token (JWT).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

