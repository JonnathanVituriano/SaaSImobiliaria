import { Module } from '@nestjs/common';
import { OwnersService } from './owners.service.js';
import { OwnersController } from './owners.controller.js';

@Module({
  controllers: [OwnersController],
  providers: [OwnersService],
})
export class OwnersModule {}