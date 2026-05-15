import { LearningMaterialRepository } from './learning-materials.repository';
import { PrismaService } from '../../database/prisma.service';
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

const mockPrisma = {
  learningMaterial: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaService;

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
      (mockPrisma.learningMaterial.create as jest.Mock).mockResolvedValue({
        id: 'uuid-1',
      });
      (mockPrisma.learningMaterial.findUnique as jest.Mock).mockResolvedValue(
        mockMaterial,
      );

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
      (mockPrisma.learningMaterial.update as jest.Mock).mockResolvedValue(
        mockMaterial,
      );
      (mockPrisma.learningMaterial.findUnique as jest.Mock).mockResolvedValue(
        mockMaterial,
      );

      await repository.update('uuid-1', dto);

      expect(mockPrisma.learningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
    });
  });

  describe('findOne', () => {
    it('returns a learning material by id', async () => {
      (mockPrisma.learningMaterial.findUnique as jest.Mock).mockResolvedValue(
        mockMaterial,
      );
      const result = await repository.findOne('uuid-1');
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('remove', () => {
    it('soft deletes a learning material by setting deletedAt', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockMaterial, deletedAt };
      (mockPrisma.learningMaterial.update as jest.Mock).mockResolvedValue(
        softDeleted,
      );

      const result = await repository.remove('uuid-1');

      expect(mockPrisma.learningMaterial.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toMatchObject({ id: 'uuid-1', deletedAt });
    });
  });
});
