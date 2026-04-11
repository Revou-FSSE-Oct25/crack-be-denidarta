import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialsRepository } from './learning-materials.repository';

const mockLearningMaterialsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LearningMaterialsService', () => {
  let service: LearningMaterialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningMaterialsService,
        {
          provide: LearningMaterialsRepository,
          useValue: mockLearningMaterialsRepository,
        },
      ],
    }).compile();

    service = module.get<LearningMaterialsService>(LearningMaterialsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
