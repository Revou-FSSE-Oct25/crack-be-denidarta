import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialRepository } from './learning-materials.repository';

const mockRepo = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByCourse: jest.fn(),
};

describe('LearningMaterialsService', () => {
  let service: LearningMaterialsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningMaterialsService,
        { provide: LearningMaterialRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(LearningMaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeInstanceOf(LearningMaterialsService);
  });

  it('findOne throws NotFoundException when absent', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns paginated envelope', async () => {
    mockRepo.findAll.mockResolvedValue([
      [
        {
          id: '1',
          title: 'T',
          materialType: 'article',
          fileUrl: null,
          orderIndex: 0,
          createdAt: new Date(),
          uploader: null,
          course: { id: 'c1', name: 'Course 1' },
        },
      ],
      1,
    ]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result.meta.total).toBe(1);
  });
});
