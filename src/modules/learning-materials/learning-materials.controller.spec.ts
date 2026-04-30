import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialsController } from './learning-materials.controller';
import { LearningMaterialsService } from './learning-materials.service';

const mockLearningMaterialsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LearningMaterialsController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningMaterialsController],
      providers: [
        {
          provide: LearningMaterialsService,
          useValue: mockLearningMaterialsService,
        },
      ],
    }).compile();

    const controller: unknown = module.get(LearningMaterialsController);
    expect(controller).toBeInstanceOf(LearningMaterialsController);
  });
});
