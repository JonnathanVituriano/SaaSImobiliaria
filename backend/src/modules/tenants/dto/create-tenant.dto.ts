import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreateTenantDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cpf: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsNotEmpty() whatsapp: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    }