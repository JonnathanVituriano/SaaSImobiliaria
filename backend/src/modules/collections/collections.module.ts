import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service.js';
import { CollectionsController } from './collections.controller.js';
import { CollectionsCron } from './collections.cron.js';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsCron],
})
export class CollectionsModule {}

