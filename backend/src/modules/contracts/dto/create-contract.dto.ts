import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsNumber()
  @IsNotEmpty()
  rentAmount: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // Enviado como ISO8601 (YYYY-MM-DD)

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  status?: string; // 'active', 'terminated'

  @IsString()
  @IsOptional()
  notes?: string;
}

