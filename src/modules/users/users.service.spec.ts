import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';

describe('UsersService', () => {
  const mockRepo = {
    findOne: jest.fn(),
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(mockRepo as unknown as UserRepository);
  });

  it('findOne throws NotFoundException when user not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });
});
