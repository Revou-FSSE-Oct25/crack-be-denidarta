import { LearningMaterialRepository } from './learning-materials.repository';
import { PrismaService } from '../../database/prisma.service';
import { MaterialType } from '@prisma/client';

const mockLearningMaterial = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockPrisma = {
  learningMaterial: mockLearningMaterial,
} as unknown as PrismaService;

const mockMaterial = {
  id: 'uuid-1',
  courseId: 'uuid-course-1',
  title: 'Introduction to NestJS',
  content: 'NestJS is a framework...',
  fileUrl: null,
  materialType: MaterialType.article,
  orderIndex: 1,
  createdAt: new Date('2026-04-15T10:00:00.000Z'),
  updatedAt: new Date('2026-04-15T10:00:00.000Z'),
  deletedAt: null,
};

describe('LearningMaterialRepository', () => {
  let repository: LearningMaterialRepository;

  beforeEach(() => {
    repository = new LearningMaterialRepository(mockPrisma);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates and returns a new learning material', async () => {
      const dto = {
        courseId: 'uuid-course-1',
        title: 'Introduction to NestJS',
        materialType: MaterialType.article,
        uploadedBy: 'uuid-user-1',
      };
      mockLearningMaterial.create.mockResolvedValue(mockMaterial);

      const result = await repository.create(dto);

      expect(mockLearningMaterial.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('findAll', () => {
    it('returns all learning materials excluding soft deleted records', async () => {
      const materials = [mockMaterial, { ...mockMaterial, id: 2 }];
      mockLearningMaterial.findMany.mockResolvedValue(materials);

      const result = await repository.findAll();

      expect(mockLearningMaterial.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toEqual(materials);
    });
  });

  describe('findOne', () => {
    it('returns a learning material by id', async () => {
      mockLearningMaterial.findUnique.mockResolvedValue(mockMaterial);

      const result = await repository.findOne('uuid-1');

      expect(mockLearningMaterial.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('update', () => {
    it('updates and returns the updated learning material', async () => {
      const dto = { title: 'Advanced NestJS', orderIndex: 2 };
      const updated = { ...mockMaterial, ...dto };
      mockLearningMaterial.update.mockResolvedValue(updated);

      const result = await repository.update('uuid-1', dto);

      expect(mockLearningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('soft deletes a learning material by setting deletedAt', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockMaterial, deletedAt };
      mockLearningMaterial.update.mockResolvedValue(softDeleted);

      const result = await repository.remove('uuid-1');

      expect(mockLearningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toMatchObject({ id: 'uuid-1', deletedAt });
    });
  });
});
