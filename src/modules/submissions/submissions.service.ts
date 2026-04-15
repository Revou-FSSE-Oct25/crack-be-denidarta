import { Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsRepository } from './submissions.repository';

@Injectable()
export class SubmissionsService {
  constructor(private readonly submissionRepository: SubmissionsRepository) {}

  create(dto: CreateSubmissionDto) {
    return this.submissionRepository.create(dto);
  }

  findAll(
    filter: {
      studentId?: number;
      assignmentId?: number;
      courseId?: number;
    } = {},
  ) {
    return this.submissionRepository.findAll(filter);
  }

  findOne(id: number) {
    return this.submissionRepository.findOne(id);
  }

  update(id: number, dto: UpdateSubmissionDto) {
    return this.submissionRepository.update(id, dto);
  }

  remove(id: number) {
    return this.submissionRepository.remove(id);
  }
}
