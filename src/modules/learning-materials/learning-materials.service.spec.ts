import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialRepository } from './learning-materials.repository';

const mockLearningMaterialsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LearningMaterialsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningMaterialsService,
        {
          provide: LearningMaterialRepository,
          useValue: mockLearningMaterialsRepository,
        },
      ],
    }).compile();

    const service: unknown = module.get(LearningMaterialsService);
    expect(service).toBeInstanceOf(LearningMaterialsService);
  });
});
