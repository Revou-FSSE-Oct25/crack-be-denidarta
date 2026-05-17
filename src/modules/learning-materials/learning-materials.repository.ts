import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';

@Injectable()
export class LearningMaterialRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLearningMaterialDto) {
    const material = await this.prisma.learningMaterial.create({ data: dto });
    return this.findOne(material.id);
  }

  async findAll(
    skip: number,
    take: number,
    search?: string,
  ): Promise<[any[], number]> {
    const where: Prisma.LearningMaterialWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
      }),
    };
    return Promise.all([
      this.prisma.learningMaterial.findMany({
        where,
        select: {
          id: true,
          title: true,
          materialType: true,
          fileUrl: true,
          orderIndex: true,
          createdAt: true,
          uploader: {
            select: {
              id: true,
              username: true,
              profile: { select: { fullName: true } },
            },
          },
          course: { select: { id: true, name: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.learningMaterial.count({ where }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.learningMaterial.findUnique({
      where: { id },
      include: {
        uploader: { include: { profile: true } },
        course: true,
      },
    });
  }

  async update(id: string, dto: UpdateLearningMaterialDto) {
    await this.prisma.learningMaterial.update({ where: { id }, data: dto });
    return this.findOne(id);
  }

  findByCourse(courseId: string) {
    return this.prisma.learningMaterial.findMany({
      where: { courseId, deletedAt: null },
      include: {
        uploader: { include: { profile: true } },
        course: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  remove(id: string) {
    return this.prisma.learningMaterial.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
