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

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.submissionsService.create(createSubmissionDto, currentUser);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('assignmentId') assignmentId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.submissionsService.findAll({
      studentId: studentId ? studentId : undefined,
      assignmentId: assignmentId ? assignmentId : undefined,
      courseId: courseId ? courseId : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.submissionsService.findOne(id, currentUser);
  }

  /** Student updates their own submission (text, file, status). */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto, currentUser);
  }

  /**
   * PATCH /submissions/:id/grade
   *
   * Grade a submission by filling in the criteria checklist.
   * The `grade` field is computed from `criteriaScores` and stored in one write.
   * Only accessible by admin or instructor.
   */
  @Patch(':id/grade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.instructor)
  grade(
    @Param('id') id: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.submissionsService.grade(id, gradeSubmissionDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: JwtPayload) {
    return this.submissionsService.remove(id, currentUser);
  }
}
