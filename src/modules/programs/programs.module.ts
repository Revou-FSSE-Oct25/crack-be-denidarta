import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { ProgramRepository } from './programs.repository';

@Module({
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramRepository],
})
export class ProgramsModule {}
