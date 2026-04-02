import { Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionRepository } from './submissions.repository';

@Injectable()
export class SubmissionsService {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  create(dto: CreateSubmissionDto) {
    return this.submissionRepository.create(dto);
  }

  findAll() {
    return this.submissionRepository.findAll();
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
