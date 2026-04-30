import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from './courses.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  create(dto: CreateCourseDto) {
    return this.courseRepository.create(dto);
  }

  findAll() {
    return this.courseRepository.findAll();
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
