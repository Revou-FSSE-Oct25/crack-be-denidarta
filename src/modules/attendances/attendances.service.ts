import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAttendanceDto) {
    return this.prisma.classAttendance.create({ data: dto });
  }

  findAll() {
    return this.prisma.classAttendance.findMany();
  }

  findOne(id: number) {
    return this.prisma.classAttendance.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateAttendanceDto) {
    return this.prisma.classAttendance.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.classAttendance.delete({ where: { id } });
  }
}
