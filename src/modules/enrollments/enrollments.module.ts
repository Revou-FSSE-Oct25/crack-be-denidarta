import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentRepository } from './enrollments.repository';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentRepository],
})
export class EnrollmentsModule {}
