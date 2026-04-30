import { Test, TestingModule } from '@nestjs/testing';
import { CourseRepository } from './courses.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  course: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CourseRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    const repository: unknown = module.get(CourseRepository);
    expect(repository).toBeInstanceOf(CourseRepository);
  });
});
