import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentRepository } from './assignments.repository';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  PaginationQuery,
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';

@Injectable()
export class AssignmentsService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  async create(dto: CreateAssignmentDto, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.admin &&
      currentUser.role !== UserRole.instructor
    ) {
      throw new ForbiddenException('You are not allowed to create assignment');
    }

    return this.assignmentRepository.create(dto);
  }

  async findAll(query: PaginationQuery) {
    const params = paginationParams(query);
    const [data, total] = await this.assignmentRepository.findAll(params);
    return paginatedResponse(data, total, params);
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
