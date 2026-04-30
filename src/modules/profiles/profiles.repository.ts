import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesRepository {
  constructor(private prisma: PrismaService) {}

  // ---- Create ----

  create(userId: string, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: { userId, ...dto },
    });
  }

  // ---- Read ----

  findAll() {
    return this.prisma.profile.findMany({ where: { deletedAt: null } });
  }

  findOne(id: string) {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  // ---- Update ----

  update(id: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  upsertByUserId(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  // ---- Delete ----

  remove(id: string) {
    return this.prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
