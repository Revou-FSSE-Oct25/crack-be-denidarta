import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayload; params?: { id?: string } }>();

    const currentUser = request.user;
    const courseId = request.params?.id;

    // If for some reason there's no user or courseId, let the JWT guard handle it
    if (!currentUser || !courseId) return true;

    // Non-student roles (instructor, admin) have unrestricted access
    if (currentUser.role !== UserRole.student) return true;

    // For students: verify they are enrolled in the program that contains this course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { programId: true },
    });

    // Course not found — let the service handle the 404
    if (!course) return true;

    // Course has no program — deny access for students
    if (!course.programId) {
      throw new UnauthorizedException('You are not enrolled in this course');
    }

    const enrollment = await this.prisma.programEnrollment.findFirst({
      where: {
        userId: currentUser.sub,
        programId: course.programId,
        status: { in: ['enrolled', 'completed'] },
      },
    });

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this course');
    }

    return true;
  }
}
