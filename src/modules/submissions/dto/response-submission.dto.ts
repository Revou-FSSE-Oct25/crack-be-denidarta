import { Expose, Type } from 'class-transformer';
import { SubmissionStatus } from '@prisma/client';

class StudentProfileDto {
  @Expose() fullName: string | null;
}

class StudentSummaryDto {
  @Expose() @Type(() => StudentProfileDto) profile: StudentProfileDto | null;
}

class AssignmentSummaryDto {
  @Expose() id: string;
  @Expose() title: string;
}

export class ResponseSubmissionDto {
  @Expose() id: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() submittedAt: Date | null;
  @Expose() assignmentId: string;
  @Expose() studentId: string;
  @Expose() submissionText: string | null;
  @Expose() fileUrl: string | null;
  @Expose() grade: number | null;
  @Expose() passed: boolean | null;
  @Expose() feedback: string | null;
  @Expose() status: SubmissionStatus;

  @Expose()
  @Type(() => StudentSummaryDto)
  student: StudentSummaryDto;

  @Expose()
  @Type(() => AssignmentSummaryDto)
  assignment: AssignmentSummaryDto;

  // Virtual fields for backward compatibility if needed, or just use nested
  @Expose()
  get userFullName(): string | null {
    return this.student?.profile?.fullName || null;
  }
}
