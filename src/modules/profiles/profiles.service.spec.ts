import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './profiles.repository';

describe('ProfilesService', () => {
  const mockRepo = {
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdWithStudentProfile: jest.fn(),
    findAllPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsertByUserId: jest.fn(),
    remove: jest.fn(),
  };
  let service: ProfilesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfilesService(mockRepo as unknown as ProfilesRepository);
  });

  it('findOne throws NotFoundException when absent', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findByUserId throws NotFoundException when absent', async () => {
    mockRepo.findByUserIdWithStudentProfile.mockResolvedValue(null);
    await expect(service.findByUserId('u1')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns paginated envelope', async () => {
    mockRepo.findAllPaginated.mockResolvedValue([
      [
        {
          id: '1',
          userId: 'u1',
          fullName: 'Alice',
          bio: null,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      1,
    ]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.meta.total).toBe(1);
  });
});
