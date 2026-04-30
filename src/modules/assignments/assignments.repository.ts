import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentRepository {
  constructor(private prisma: PrismaService) {}

  // ---- Create ----

  create(dto: CreateAssignmentDto) {
    return this.prisma.assignment.create({ data: dto });
  }

  // ---- Read ----

  findAll() {
    return this.prisma.assignment.findMany({ where: { deletedAt: null } });
  }

  findOne(id: string) {
    return this.prisma.assignment.findUnique({ where: { id } });
  }

  // ---- Update ----

  update(id: string, dto: UpdateAssignmentDto) {
    return this.prisma.assignment.update({ where: { id }, data: dto });
  }

  // ---- Delete ----

  remove(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
