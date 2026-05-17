import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseAccessGuard } from '../../common/guards/course-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { singleResponse } from '../../common/utils/pagination.util';
import { CourseQueryDto } from './dto/course-query.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    return singleResponse(await this.coursesService.create(createCourseDto));
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: JwtPayload,
    @Query() query: CourseQueryDto,
  ) {
    return this.coursesService.findAll(query, currentUser);
  }

  @UseGuards(CourseAccessGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.coursesService.findOne(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return singleResponse(
      await this.coursesService.update(id, updateCourseDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return singleResponse(await this.coursesService.remove(id));
  }
}
