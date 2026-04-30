import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentRepository } from './enrollments.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  enrollment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EnrollmentRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    const repository: unknown = module.get(EnrollmentRepository);
    expect(repository).toBeInstanceOf(EnrollmentRepository);
  });
});
