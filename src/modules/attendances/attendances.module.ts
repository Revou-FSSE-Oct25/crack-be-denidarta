import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';
import { AttendanceRepository } from './attendances.repository';

@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService, AttendanceRepository],
})
export class AttendancesModule {}
