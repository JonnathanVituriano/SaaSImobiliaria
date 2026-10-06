import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreatePropertyDto {
  @IsString() @IsNotEmpty() ownerId: string;
  @IsString() @IsNotEmpty() type: string; // casa, apartamento
  @IsString() @IsNotEmpty() addressStreet: string;
  @IsString() @IsOptional() addressNumber?: string;
  @IsString() @IsNotEmpty() addressCity: string;
  @IsString() @IsNotEmpty() addressState: string;
  @IsNumber() @IsOptional() areaSqm?: number;
  @IsString() @IsOptional() status?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    }