import { LearningMaterialRepository } from './learning-materials.repository';
import { MaterialType } from '@prisma/client';

const mockMaterial = {
  id: 'uuid-1',
  title: 'Introduction to NestJS',
  fileUrl: null,
  materialType: MaterialType.article,
  orderIndex: 1,
  createdAt: new Date('2026-04-15T10:00:00.000Z'),
  updatedAt: new Date('2026-04-15T10:00:00.000Z'),
  deletedAt: null,
};

type MockedPrismaService = {
  learningMaterial: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
};

const mockPrisma: MockedPrismaService = {
  learningMaterial: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('LearningMaterialRepository', () => {
  let repository: LearningMaterialRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new LearningMaterialRepository(mockPrisma);
  });

  describe('create', () => {
    it('creates a learning material and returns it', async () => {
      const dto = {
        title: 'Introduction to NestJS',
        materialType: MaterialType.article,
        uploadedBy: 'uuid-user-1',
        courseId: 'uuid-course-1',
      };
      mockPrisma.learningMaterial.create.mockResolvedValue({
        id: 'uuid-1',
      });
      mockPrisma.learningMaterial.findUnique.mockResolvedValue(mockMaterial);

      await repository.create(dto);

      expect(mockPrisma.learningMaterial.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(mockPrisma.learningMaterial.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-1' } }),
      );
    });
  });

  describe('update', () => {
    it('updates a learning material and returns it', async () => {
      const dto = { title: 'Advanced NestJS' };
      mockPrisma.learningMaterial.update.mockResolvedValue(mockMaterial);
      mockPrisma.learningMaterial.findUnique.mockResolvedValue(mockMaterial);

      await repository.update('uuid-1', dto);

      expect(mockPrisma.learningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
    });
  });

  describe('findOne', () => {
    it('returns a learning material by id', async () => {
      mockPrisma.learningMaterial.findUnique.mockResolvedValue(mockMaterial);
      const result = await repository.findOne('uuid-1');
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('remove', () => {
    it('soft deletes a learning material by setting deletedAt', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockMaterial, deletedAt };
      mockPrisma.learningMaterial.update.mockResolvedValue(softDeleted);

      const result = await repository.remove('uuid-1');

      expect(mockPrisma.learningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toMatchObject({ id: 'uuid-1', deletedAt });
    });
  });
});
