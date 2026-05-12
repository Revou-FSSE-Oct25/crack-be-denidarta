import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseRepository } from './courses.repository';
import { CourseAccessGuard } from '../../common/guards/course-access.guard';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, CourseRepository, CourseAccessGuard],
})
export class CoursesModule {}
