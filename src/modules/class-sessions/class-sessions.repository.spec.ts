import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionRepository } from './class-sessions.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  classSession: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ClassSessionRepository', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    const repository: unknown = module.get(ClassSessionRepository);
    expect(repository).toBeInstanceOf(ClassSessionRepository);
  });
});
