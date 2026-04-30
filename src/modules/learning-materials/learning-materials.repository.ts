import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';

@Injectable()
export class LearningMaterialRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLearningMaterialDto) {
    return this.prisma.learningMaterial.create({ data: dto });
  }

  findAll() {
    return this.prisma.learningMaterial.findMany({
      where: { deletedAt: null },
    });
  }

  findOne(id: string) {
    return this.prisma.learningMaterial.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateLearningMaterialDto) {
    return this.prisma.learningMaterial.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.learningMaterial.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
