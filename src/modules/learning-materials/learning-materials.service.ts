import { Injectable } from '@nestjs/common';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { LearningMaterialRepository } from './learning-materials.repository';

@Injectable()
export class LearningMaterialsService {
  constructor(
    private readonly learningMaterialRepository: LearningMaterialRepository,
  ) {}

  create(dto: CreateLearningMaterialDto) {
    return this.learningMaterialRepository.create(dto);
  }

  findAll(
    skip: number,
    take: number,
    search?: string,
  ): Promise<[any[], number]> {
    return this.learningMaterialRepository.findAll(skip, take, search);
  }

  findOne(id: string) {
    return this.learningMaterialRepository.findOne(id);
  }

  update(id: string, dto: UpdateLearningMaterialDto) {
    return this.learningMaterialRepository.update(id, dto);
  }

  findByCourse(courseId: string) {
    return this.learningMaterialRepository.findByCourse(courseId);
  }

  findByProgram(programId: string) {
    return this.learningMaterialRepository.findByProgram(programId);
  }

  remove(id: string) {
    return this.learningMaterialRepository.remove(id);
  }
}
