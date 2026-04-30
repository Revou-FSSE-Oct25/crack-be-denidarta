import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAttendanceDto) {
    return this.prisma.classAttendance.create({ data: dto });
  }

  findAll() {
    return this.prisma.classAttendance.findMany();
  }

  findOne(id: string) {
    return this.prisma.classAttendance.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateAttendanceDto) {
    return this.prisma.classAttendance.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.classAttendance.delete({ where: { id } });
  }
}
