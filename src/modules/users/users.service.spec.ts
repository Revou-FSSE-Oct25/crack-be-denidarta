import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { PrismaService } from '../../database/prisma.service';

const mockRepo = {
  findOne: jest.fn(),
  setResetToken: jest.fn(),
};

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(
      mockRepo as unknown as UserRepository,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('findOne throws NotFoundException when user not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  describe('setResetToken', () => {
    it('delegates to repository with id, token, and expiresAt', async () => {
      const token = '00000000-0000-0000-0000-000000000002';
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      mockRepo.setResetToken.mockResolvedValue({ id: '1' });

      await service.setResetToken('1', token, expiresAt);

      expect(mockRepo.setResetToken).toHaveBeenCalledWith('1', token, expiresAt);
    });
  });
});
