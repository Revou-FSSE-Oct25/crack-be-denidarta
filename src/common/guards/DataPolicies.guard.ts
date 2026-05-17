import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../decorators/current-user.decorator';
import { RESOURCE_OWNER_KEY } from '../decorators/resource-owner.decorator';

@Injectable()
export class DataPoliciesGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const paramName = this.reflector.getAllAndOverride<string | undefined>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!paramName) return true;

    const req = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      params?: Record<string, string>;
    }>();

    const user = req.user;
    if (!user || user.role !== UserRole.student) return true;

    const resourceId = req.params?.[paramName];
    if (!resourceId) return true;

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: resourceId },
      select: { studentId: true },
    });

    if (!submission) return true;

    if (submission.studentId !== user.sub) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}
