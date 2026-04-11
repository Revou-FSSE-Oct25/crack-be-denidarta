import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsRepository } from './class-sessions.repository';
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

describe('ClassSessionsRepository', () => {
  let repository: ClassSessionsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<ClassSessionsRepository>(ClassSessionsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
