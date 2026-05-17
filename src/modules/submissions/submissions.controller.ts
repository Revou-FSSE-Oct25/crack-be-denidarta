import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DataPoliciesGuard } from '../../common/guards/DataPolicies.guard';
import { ResourceOwner } from '../../common/decorators/resource-owner.decorator';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.create(createSubmissionDto, currentUser),
    );
  }

  @Patch(':id/submit')
  @UseGuards(DataPoliciesGuard)
  @ResourceOwner('id')
  async submit(
    @Param('id') id: string,
    @Body() submitAssignmentDto: SubmitAssignmentDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.submitAssignmentByStudent(
        id,
        submitAssignmentDto,
        currentUser,
      ),
    );
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: JwtPayload,
    @Query() query: PaginationQueryDto,
    @Query('studentId') studentId?: string,
    @Query('assignmentId') assignmentId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.submissionsService.findAll(
      {
        studentId: studentId ?? undefined,
        assignmentId: assignmentId ?? undefined,
        courseId: courseId ?? undefined,
      },
      query,
      currentUser,
    );
  }

  @Get(':id')
  @UseGuards(DataPoliciesGuard)
  @ResourceOwner('id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.findOne(id, currentUser),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.update(
        id,
        updateSubmissionDto,
        currentUser,
      ),
    );
  }

  @Patch(':id/grade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.instructor)
  async grade(
    @Param('id') id: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.grade(id, gradeSubmissionDto, currentUser),
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return singleResponse(
      await this.submissionsService.remove(id, currentUser),
    );
  }
}
