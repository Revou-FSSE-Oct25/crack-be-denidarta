import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return singleResponse(
      await this.enrollmentsService.create(createEnrollmentDto),
    );
  }

  @Roles(UserRole.admin, UserRole.instructor)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return singleResponse(await this.enrollmentsService.findByUserId(userId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.enrollmentsService.findOne(id));
  }

  @Roles(UserRole.admin, UserRole.instructor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return singleResponse(
      await this.enrollmentsService.update(id, updateEnrollmentDto),
    );
  }

  @Roles(UserRole.admin, UserRole.instructor)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.enrollmentsService.remove(id));
  }
}
