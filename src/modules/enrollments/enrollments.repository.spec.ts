import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsRepository } from './enrollments.repository';
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

describe('EnrollmentsRepository', () => {
  let repository: EnrollmentsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<EnrollmentsRepository>(EnrollmentsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
