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
  let repository: AssignmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<AssignmentRepository>(AssignmentRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
