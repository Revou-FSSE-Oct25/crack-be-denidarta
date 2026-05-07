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
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
  ) {
    return this.submissionRepository.findAll(filter);
  }

  async findOne(id: string, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || submission.deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isAuthorized =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner = submission.studentId === currentUser.sub;

    if (!isAuthorized && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to view this submission',
      );
    }

    return submission;
  }

  update(id: string, dto: UpdateSubmissionDto) {
    return this.submissionRepository.update(id, dto);
  }

  remove(id: string) {
    return this.submissionRepository.remove(id);
  }
}
