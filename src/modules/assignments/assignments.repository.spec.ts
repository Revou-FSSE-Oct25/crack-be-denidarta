import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentRepository } from './assignments.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  assignment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AssignmentRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    const repository: unknown = module.get(AssignmentRepository);
    expect(repository).toBeInstanceOf(AssignmentRepository);
  });
});
