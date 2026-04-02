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

  findAll() {
    return this.learningMaterialRepository.findAll();
  }

  findOne(id: number) {
    return this.learningMaterialRepository.findOne(id);
  }

  update(id: number, dto: UpdateLearningMaterialDto) {
    return this.learningMaterialRepository.update(id, dto);
  }

  remove(id: number) {
    return this.learningMaterialRepository.remove(id);
  }
}
