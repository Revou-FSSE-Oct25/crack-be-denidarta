import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { AssignmentRepository } from './assignments.repository';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentRepository],
})
export class AssignmentsModule {}
