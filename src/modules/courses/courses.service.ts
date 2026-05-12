import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from './courses.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  create(dto: CreateCourseDto) {
    return this.courseRepository.create(dto);
  }

  findAll(currentUser: JwtPayload) {
    const userId =
      currentUser.role === UserRole.student ? currentUser.sub : undefined;
    return this.courseRepository.findAll(userId);
  }

  findOne(id: string) {
    return this.courseRepository.findOne(id);
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.courseRepository.update(id, dto);
  }

  remove(id: string) {
    return this.courseRepository.remove(id);
  }
}
