import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { CourseRepository } from './courses.repository';

const mockCoursesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CoursesService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CourseRepository, useValue: mockCoursesRepository },
      ],
    }).compile();

    const service: unknown = module.get(CoursesService);
    expect(service).toBeInstanceOf(CoursesService);
  });
});
