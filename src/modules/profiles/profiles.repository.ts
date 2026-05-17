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

  findAllPaginated(skip: number, take: number) {
    return Promise.all([
      this.prisma.profile.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where: { deletedAt: null } }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.profile.findFirst({ where: { id, deletedAt: null } });
  }

  findByUserId(userId: string) {
    return this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  async findByUserIdWithStudentProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        profile: true,
        studentProfile: true,
      },
    });
    if (!user?.profile) return null;
    const { profile, studentProfile } = user;
    const { id: _spId, userId: _spUserId, createdAt: _spCreatedAt, updatedAt: _spUpdatedAt, ...studentFields } =
      studentProfile ?? ({} as never);
    return { ...profile, ...studentFields };
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
