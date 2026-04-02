import { Module } from '@nestjs/common';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialsController } from './learning-materials.controller';
import { LearningMaterialRepository } from './learning-materials.repository';

@Module({
  controllers: [LearningMaterialsController],
  providers: [LearningMaterialsService, LearningMaterialRepository],
})
export class LearningMaterialsModule {}
