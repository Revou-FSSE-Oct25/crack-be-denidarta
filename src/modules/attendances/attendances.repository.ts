import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  EnrollmentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';

@Injectable()
export class AttendanceRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAttendanceDto) {
    return this.prisma.classAttendance.create({ data: dto });
  }

  findAll(user: JwtPayload) {
    if (user.role === UserRole.student) {
      /**
       * Students only see their own attendance records, scoped to courses
       * that belong to programs they are actively enrolled in.
       */
      return this.prisma.classAttendance.findMany({
        where: {
          userId: user.sub,
          classSession: {
            course: {
              program: {
                programs: {
                  some: {
                    userId: user.sub,
                    status: EnrollmentStatus.enrolled,
                  },
                },
              },
            },
          },
        },
      });
    }

    // admin / instructor — return everything
    return this.prisma.classAttendance.findMany();
  }

  findOne(id: string) {
    return this.prisma.classAttendance.findUnique({ where: { id } });
  }

  findBySession(classSessionId: string): Promise<
    Prisma.ClassAttendanceGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            username: true;
            profile: { select: { fullName: true } };
          };
        };
      };
    }>[]
  > {
    return this.prisma.classAttendance.findMany({
      where: { classSessionId },
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

  update(id: string, dto: UpdateAttendanceDto) {
    return this.prisma.classAttendance.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.classAttendance.delete({ where: { id } });
  }

  /**
   * Auto-generates ClassAttendance records (status = unverified) for every
   * enrolled student in the program linked to the given class session.
   * Called when ClassSession.status transitions to "ongoing".
   */
  async generateForSession(classSessionId: string): Promise<void> {
    // 1. Fetch session + course to get programId
    const session = await this.prisma.classSession.findUnique({
      where: { id: classSessionId },
      include: { course: true },
    });

    if (!session) throw new NotFoundException('Class session not found');
    if (!session.course.programId) return; // course not linked to any program

    // 2. Get all actively enrolled users in the program
    const enrollments = await this.prisma.programEnrollment.findMany({
      where: {
        programId: session.course.programId,
        status: EnrollmentStatus.enrolled,
      },
      select: { userId: true },
    });

    if (enrollments.length === 0) return;

    // 3. Bulk-insert attendance records; skip duplicates (idempotent)
    await this.prisma.classAttendance.createMany({
      data: enrollments.map(({ userId }) => ({
        classSessionId,
        userId,
        status: AttendanceStatus.unverified,
        isVerified: false,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Student marks their own attendance as "present".
   * Forbidden if the attendance does not belong to them or is already verified.
   */
  async studentCheckIn(id: string, userId: string) {
    const attendance = await this.prisma.classAttendance.findUnique({
      where: { id },
    });

    if (!attendance) throw new NotFoundException('Attendance record not found');
    if (attendance.userId !== userId)
      throw new ForbiddenException(
        'You can only update your own attendance record',
      );
    if (attendance.isVerified)
      throw new ForbiddenException(
        'Attendance has already been verified and cannot be changed',
      );

    return this.prisma.classAttendance.update({
      where: { id },
      data: { status: AttendanceStatus.present },
    });
  }

  /**
   * Admin / instructor verifies an attendance record.
   * Sets isVerified, verifiedAt, verifiedBy, and optionally overrides status.
   */
  async verifyAttendance(
    id: string,
    verifierId: string,
    dto: VerifyAttendanceDto,
  ) {
    const attendance = await this.prisma.classAttendance.findUnique({
      where: { id },
    });

    if (!attendance) throw new NotFoundException('Attendance record not found');

    return this.prisma.classAttendance.update({
      where: { id },
      data: {
        isVerified: dto.isVerified,
        verifiedAt: dto.isVerified ? new Date() : null,
        verifiedBy: dto.isVerified ? verifierId : null,
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }
}
