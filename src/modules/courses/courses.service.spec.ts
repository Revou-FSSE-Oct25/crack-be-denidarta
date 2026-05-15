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

  it('findOne throws NotFoundException when course is not found', async () => {
    const { NotFoundException } =
      jest.requireActual<typeof import('@nestjs/common')>('@nestjs/common');
    const service = new CoursesService({
      findOne: jest.fn().mockResolvedValue(null),
    } as any);
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
