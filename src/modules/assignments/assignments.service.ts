import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAssignmentDto) {
    return this.prisma.assignment.create({ data: dto });
  }

  findAll() {
    return this.prisma.assignment.findMany({ where: { deletedAt: null } });
  }

  findOne(id: number) {
    return this.prisma.assignment.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateAssignmentDto) {
    return this.prisma.assignment.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
