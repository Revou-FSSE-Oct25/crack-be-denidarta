import { Injectable } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProgramCertificatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Enrollment ───────────────────────────────────────────────────

  /**
   * Find an enrollment by its ID, scoped to the given programId.
   * Returns the enrollment together with the user's basic info and profile.
   */
  findEnrollment(enrollmentId: string, programId: string) {
    return this.prisma.programEnrollment.findFirst({
      where: { id: enrollmentId, programId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });
  }

  // ─── Program ──────────────────────────────────────────────────────

  findProgram(programId: string) {
    return this.prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, name: true },
    });
  }

  // ─── Eligibility data ─────────────────────────────────────────────

  /**
   * Fetch every published / closed assignment in all courses of the
   * given program, including the student's graded submission (if any).
   * This is done in one query to keep the eligibility check lean.
   */
  findAssignmentsWithSubmissions(programId: string, studentId: string) {
    return this.prisma.assignment.findMany({
      where: {
        course: { programId, deletedAt: null },
        status: { in: [AssignmentStatus.published, AssignmentStatus.closed] },
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        submissions: {
          where: { studentId, deletedAt: null },
          select: { status: true, passed: true },
          take: 1,
        },
      },
    });
  }

  // ─── Certificate CRUD ─────────────────────────────────────────────

  /** Check for an existing certificate (unique per student + program). */
  findCertificate(userId: string, programId: string) {
    return this.prisma.certificate.findUnique({
      where: { userId_programId: { userId, programId } },
    });
  }

  /** Create a new program certificate. */
  createCertificate(data: {
    userId: string;
    programId: string;
    certNumber: string;
    studentNameSnapshot: string;
    programNameSnapshot: string;
  }) {
    return this.prisma.certificate.create({ data });
  }

  /** Get a single certificate for a specific student + program. */
  findCertificateByUserAndProgram(userId: string, programId: string) {
    return this.prisma.certificate.findUnique({
      where: { userId_programId: { userId, programId } },
    });
  }

  /** List all (non-deleted) certificates issued to a user. */
  findUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId, deletedAt: null },
      include: {
        program: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /** List every non-deleted certificate across all students. */
  findAllCertificates() {
    return this.prisma.certificate.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        program: { select: { id: true, name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
