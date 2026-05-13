import { Module } from '@nestjs/common';
import {
  MyCertificatesController,
  ProgramCertificatesController,
} from './program-certificates.controller';
import { ProgramCertificatesRepository } from './program-certificates.repository';
import { ProgramCertificatesService } from './program-certificates.service';

@Module({
  controllers: [ProgramCertificatesController, MyCertificatesController],
  providers: [ProgramCertificatesService, ProgramCertificatesRepository],
})
export class ProgramCertificatesModule {}
