import { Module } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsController } from './class-sessions.controller';
import { ClassSessionRepository } from './class-sessions.repository';
import { AttendancesModule } from '../attendances/attendances.module';

@Module({
  imports: [AttendancesModule],
  controllers: [ClassSessionsController],
  providers: [ClassSessionsService, ClassSessionRepository],
})
export class ClassSessionsModule {}
