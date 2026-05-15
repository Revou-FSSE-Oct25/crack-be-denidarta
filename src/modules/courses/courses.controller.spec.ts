import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../database/prisma.service';

const mockCoursesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockPrismaService = {};

describe('CoursesController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    const controller: unknown = module.get(CoursesController);
    expect(controller).toBeInstanceOf(CoursesController);
  });
});
