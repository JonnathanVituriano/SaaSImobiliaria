import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string; // reminder, collection, warning, final_notice

  @IsNumber()
  @IsOptional()
  daysOverdueMin?: number;

  @IsNumber()
  @IsOptional()
  daysOverdueMax?: number;

  @IsString()
  @IsNotEmpty()
  messageBody: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

