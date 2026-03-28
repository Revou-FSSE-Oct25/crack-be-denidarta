import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSubmissionDto) {
    return this.prisma.assignmentSubmission.create({ data: dto });
  }

  findAll() {
    return this.prisma.assignmentSubmission.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.assignmentSubmission.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateSubmissionDto) {
    return this.prisma.assignmentSubmission.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.assignmentSubmission.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
