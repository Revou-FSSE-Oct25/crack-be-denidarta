import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentRepository } from './assignments.repository';

@Injectable()
export class AssignmentsService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  create(dto: CreateAssignmentDto) {
    return this.assignmentRepository.create(dto);
  }

  findAll() {
    return this.assignmentRepository.findAll();
  }

  findOne(id: string) {
    return this.assignmentRepository.findOne(id);
  }

  update(id: string, dto: UpdateAssignmentDto) {
    return this.assignmentRepository.update(id, dto);
  }

  remove(id: string) {
    return this.assignmentRepository.remove(id);
  }
}
