import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-propertie.dto.js';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}