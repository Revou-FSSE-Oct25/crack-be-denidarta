import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProgramCertificatesService } from './program-certificates.service';

/**
 * Routes nested under a specific program enrollment:
 *   /programs/:programId/enrollments/:enrollmentId/...
 */
@Controller('programs/:programId/enrollments/:enrollmentId')
export class ProgramCertificatesController {
  constructor(private readonly service: ProgramCertificatesService) {}

  /**
   * GET /programs/:programId/enrollments/:enrollmentId/certificate-eligibility
   *
   * Returns whether the student has passed every published/closed assignment
   * in the program, plus a list of failing assignments if not.
   *
   * Admin only.
   */
  @Get('certificate-eligibility')
  @Roles(UserRole.admin)
  checkEligibility(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.service.checkEligibility(programId, enrollmentId);
  }

  /**
   * POST /programs/:programId/enrollments/:enrollmentId/certificate
   *
   * Manually issue a program certificate for the enrolled student.
   * Re-runs eligibility check internally — returns 400 with failingAssignments
   * if the student is not eligible, and 409 if a certificate already exists.
   *
   * Admin only.
   */
  @Post('certificate')
  @Roles(UserRole.admin)
  issueCertificate(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    return this.service.issueCertificate(programId, enrollmentId);
  }

  /**
   * GET /programs/:programId/enrollments/:enrollmentId/certificate
   *
   * Fetch the issued certificate for the student.
   * Admin can view any certificate; a student can only view their own.
   */
  @Get('certificate')
  getCertificate(
    @Param('programId') programId: string,
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.service.getCertificate(programId, enrollmentId, currentUser);
  }
}

/**
 * Routes for the currently authenticated user's own certificates.
 */
@Controller('certificates')
export class MyCertificatesController {
  constructor(private readonly service: ProgramCertificatesService) {}

  /**
   * GET /certificates
   *
   * Fetch all program certificates issued across every student.
   * Restricted to instructors (employees) only — access is enforced by the
   * global RolesGuard using the `role` claim in the JWT payload.
   */
  @Get()
  @Roles(UserRole.instructor, UserRole.admin)
  getAllCertificates(@CurrentUser() currentUser: JwtPayload) {
    return this.service.getAllCertificates(currentUser);
  }

  /**
   * GET /certificates/my
   *
   * List all program certificates belonging to the current student,
   * ordered newest first.
   *
   * Student only.
   */
  @Get('my')
  @Roles(UserRole.student)
  getMyCertificates(@CurrentUser() currentUser: JwtPayload) {
    return this.service.getMyCertificates(currentUser);
  }
}
