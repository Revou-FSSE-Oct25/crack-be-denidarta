import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsRepository } from './submissions.repository';
import { DatabaseModule } from '../../database/database.module';
import { DataPoliciesGuard } from '../../common/guards/DataPolicies.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository, DataPoliciesGuard],
})
export class SubmissionsModule {}
