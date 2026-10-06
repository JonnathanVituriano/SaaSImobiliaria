import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO reutilizável para paginação.
 *
 * Uso nos controllers:
 *   @Query() pagination: PaginationDto
 *
 * O frontend envia: ?page=1&limit=20
 */
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Converte string da query para number
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100) // Limite máximo para evitar queries pesadas
  @Type(() => Number)
  limit: number = 20;

  /**
   * Calcula o offset para o Prisma (skip)
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

/**
 * Interface para resposta paginada.
 *
 * Uso nos services:
 *   return { data: items, meta: { total, page, limit, totalPages } }
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

