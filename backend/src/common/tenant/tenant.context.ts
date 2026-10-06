import { AsyncLocalStorage } from 'async_hooks';

/**
 * Armazena o ID da organização do usuário atual logado durante o ciclo de vida
 * de uma requisição HTTP, sem precisar ficar passando a variável de função em função.
 */
export const tenantContext = new AsyncLocalStorage<string>();

