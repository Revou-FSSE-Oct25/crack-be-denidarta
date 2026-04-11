import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialsRepository } from './learning-materials.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  learningMaterial: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('LearningMaterialsRepository', () => {
  let repository: LearningMaterialsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningMaterialsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<LearningMaterialsRepository>(LearningMaterialsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
