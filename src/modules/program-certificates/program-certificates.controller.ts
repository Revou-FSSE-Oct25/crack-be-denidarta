import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProgramCertificatesService } from './program-certificates.service';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('programs/:programId/enrollments/:enrollmentId')
export class ProgramCertificatesController {
  constructor(private readonly service: ProgramCertificatesService) {}

  @Get('certificate-eligibility')
  @Roles(UserRole.admin)
  checkEligibility(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.service.checkEligibility(programId, enrollmentId);
  }

  @Post('certificate')
  @Roles(UserRole.admin)
  async issueCertificate(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return singleResponse(
      await this.service.issueCertificate(programId, enrollmentId),
    );
  }

  @Get('certificate')
  async getCertificate(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.service.getCertificate(programId, enrollmentId, currentUser),
    );
  }
}

@Controller('certificates')
export class MyCertificatesController {
  constructor(private readonly service: ProgramCertificatesService) {}

  @Get()
  @Roles(UserRole.instructor, UserRole.admin)
  getAllCertificates(
    @CurrentUser() currentUser: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.getAllCertificates(currentUser, query);
  }

  @Get('my')
  @Roles(UserRole.student)
  getMyCertificates(
    @CurrentUser() currentUser: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.getMyCertificates(currentUser, query);
  }
}
