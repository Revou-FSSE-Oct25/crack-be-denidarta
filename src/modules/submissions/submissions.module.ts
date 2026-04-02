import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionRepository } from './submissions.repository';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionRepository],
})
export class SubmissionsModule {}
