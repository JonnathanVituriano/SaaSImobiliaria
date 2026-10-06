import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreateOwnerDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() cpfCnpj: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() bankPixKey?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
    }