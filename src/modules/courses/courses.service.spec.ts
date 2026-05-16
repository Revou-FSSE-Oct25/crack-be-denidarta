import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { CourseRepository } from './courses.repository';
import { NotFoundException } from '@nestjs/common'; // Import NotFoundException

const mockCoursesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Define a type for the partial mock of CourseRepository
type MockCourseRepository = Partial<CourseRepository>;

describe('CoursesService', () => {
  afterEach(() => jest.clearAllMocks());

  it('findOne throws NotFoundException when course is not found', async () => {
    // Explicitly type the mock for the constructor
    const partialMockCourseRepository: MockCourseRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const service = new CoursesService(
      partialMockCourseRepository as CourseRepository,
    );
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

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
