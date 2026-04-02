import { Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentRepository } from './enrollments.repository';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  create(dto: CreateEnrollmentDto) {
    return this.enrollmentRepository.create(dto);
  }

  findAll() {
    return this.enrollmentRepository.findAll();
  }

  findOne(id: number) {
    return this.enrollmentRepository.findOne(id);
  }

  update(id: number, dto: UpdateEnrollmentDto) {
    return this.enrollmentRepository.update(id, dto);
  }

  remove(id: number) {
    return this.enrollmentRepository.remove(id);
  }
}
