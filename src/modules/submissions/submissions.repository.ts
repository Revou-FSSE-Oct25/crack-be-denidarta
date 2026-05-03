import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSubmissionDto) {
    return this.prisma.assignmentSubmission.create({ data: dto });
  }

  findAll(
    filter: {
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
  ) {
    return this.prisma.assignmentSubmission.findMany({
      where: {
        deletedAt: null,
        ...(filter.studentId && { userId: filter.studentId }),
        ...(filter.assignmentId && { assignmentId: filter.assignmentId }),
        ...(filter.courseId && { assignment: { courseId: filter.courseId } }),
      },
    });
  }

  findOne(id: string) {
    return this.prisma.assignmentSubmission.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateSubmissionDto) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
