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

  findAll(
    skip: number,
    take: number,
    search: string | undefined,
    currentUser: JwtPayload,
  ): Promise<[any[], number]> {
    if (currentUser.role === UserRole.student) {
      return this.courseRepository.findStudentsCourse(
        currentUser.sub,
        skip,
        take,
        search,
      );
    }
    return this.courseRepository.findAll(skip, take, search);
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
