import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubmissionStatus, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProgramCertificatesRepository } from './program-certificates.repository';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface FailingAssignment {
  assignmentId: string;
  courseId: string;
  title: string;
  reason: 'not_submitted' | 'not_graded' | 'failed';
}

export interface EligibilityResult {
  eligible: boolean;
  failingAssignments: FailingAssignment[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ProgramCertificatesService {
  constructor(private readonly repo: ProgramCertificatesRepository) {}

  // ─── Eligibility ───────────────────────────────────────────────────

  /**
   * Check whether a student (identified via enrollmentId) has passed all
   * published/closed assignments in the program.
   */
  async checkEligibility(
    programId: string,
    enrollmentId: string,
  ): Promise<EligibilityResult> {
    const enrollment = await this.repo.findEnrollment(enrollmentId, programId);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this program');
    }

    return this.runEligibilityCheck(programId, enrollment.userId);
  }

  // ─── Issue ─────────────────────────────────────────────────────────

  /**
   * Manually issue a program certificate for an enrolled student.
   * Steps:
   *  1. Verify enrollment belongs to program → 400 if not
   *  2. Re-run eligibility check → 400 with failingAssignments if ineligible
   *  3. Guard against duplicate → 409 if one already exists
   *  4. Snapshot student name (profile.fullName ?? username) and program name
   *  5. Create the certificate record
   */
  async issueCertificate(programId: string, enrollmentId: string) {
    // 1. Verify enrollment
    const enrollment = await this.repo.findEnrollment(enrollmentId, programId);
    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in this program');
    }

    const studentId = enrollment.userId;

    // 2. Re-run eligibility
    const { eligible, failingAssignments } = await this.runEligibilityCheck(
      programId,
      studentId,
    );

    if (!eligible) {
      throw new BadRequestException({
        message: 'Student is not eligible for a certificate',
        failingAssignments,
      });
    }

    // 3. Duplicate guard
    const existing = await this.repo.findCertificate(studentId, programId);
    if (existing) {
      throw new ConflictException(
        'Certificate already issued for this student and program',
      );
    }

    // 4. Build snapshots
    const program = await this.repo.findProgram(programId);
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const { user } = enrollment;
    const studentNameSnapshot = user.profile?.fullName ?? user.username;
    const programNameSnapshot = program.name;

    // 5. Generate a collision-resistant cert number and persist
    const certNumber = `CERT-${randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12)}`;

    return this.repo.createCertificate({
      userId: studentId,
      programId,
      certNumber,
      studentNameSnapshot,
      programNameSnapshot,
    });
  }

  // ─── Read ──────────────────────────────────────────────────────────

  /**
   * Fetch the certificate for a student identified by enrollmentId.
   * Admin can read any; a student can only read their own.
   */
  async getCertificate(
    programId: string,
    enrollmentId: string,
    currentUser: JwtPayload,
  ) {
    const enrollment = await this.repo.findEnrollment(enrollmentId, programId);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this program');
    }

    // Access control: admin sees all, student sees only their own
    if (
      currentUser.role !== UserRole.admin &&
      currentUser.sub !== enrollment.userId
    ) {
      throw new ForbiddenException(
        'You are not allowed to view this certificate',
      );
    }

    const cert = await this.repo.findCertificateByUserAndProgram(
      enrollment.userId,
      programId,
    );
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }

    return cert;
  }

  /**
   * List all certificates belonging to the currently authenticated student.
   */
  getMyCertificates(currentUser: JwtPayload) {
    return this.repo.findUserCertificates(currentUser.sub);
  }

  /**
   * List every certificate across all students.
   * Only accessible by instructors (employees).
   * The caller's identity is verified via the JWT payload injected by the
   * global JwtAuthGuard / RolesGuard — no extra work needed here.
   */
  getAllCertificates(_currentUser: JwtPayload) {
    return this.repo.findAllCertificates();
  }

  // ─── Internal helpers ──────────────────────────────────────────────

  /**
   * Core eligibility logic:
   *  - If the program has zero published/closed assignments → ineligible.
   *  - For every such assignment, the student must have a graded submission
   *    with passed === true.
   */
  private async runEligibilityCheck(
    programId: string,
    studentId: string,
  ): Promise<EligibilityResult> {
    const assignments = await this.repo.findAssignmentsWithSubmissions(
      programId,
      studentId,
    );

    // Empty program → never eligible
    if (assignments.length === 0) {
      return { eligible: false, failingAssignments: [] };
    }

    const failingAssignments: FailingAssignment[] = [];

    for (const assignment of assignments) {
      const submission = assignment.submissions[0];

      if (!submission) {
        failingAssignments.push({
          assignmentId: assignment.id,
          courseId: assignment.courseId,
          title: assignment.title,
          reason: 'not_submitted',
        });
      } else if (submission.status !== SubmissionStatus.graded) {
        failingAssignments.push({
          assignmentId: assignment.id,
          courseId: assignment.courseId,
          title: assignment.title,
          reason: 'not_graded',
        });
      } else if (!submission.passed) {
        failingAssignments.push({
          assignmentId: assignment.id,
          courseId: assignment.courseId,
          title: assignment.title,
          reason: 'failed',
        });
      }
    }

    return {
      eligible: failingAssignments.length === 0,
      failingAssignments,
    };
  }
}
