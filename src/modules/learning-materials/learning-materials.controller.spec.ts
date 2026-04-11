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
  let controller: LearningMaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningMaterialsController],
      providers: [
        {
          provide: LearningMaterialsService,
          useValue: mockLearningMaterialsService,
        },
      ],
    }).compile();

    controller = module.get<LearningMaterialsController>(
      LearningMaterialsController,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
