import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
import {
  createMockUser,
  createMockUserList,
} from '../../test/factories/user.factory';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  findByRole: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated users with data key when no role filter is provided', async () => {
      const users = createMockUserList(3);
      mockUsersService.findAllPaginated.mockResolvedValue({
        items: users,
        total: 3,
      });

      const result = await controller.findAll({});

      expect(mockUsersService.findAllPaginated).toHaveBeenCalled();
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('returns users filtered by role', async () => {
      const students = createMockUserList(5, { role: UserRole.student });
      mockUsersService.findAllPaginated.mockResolvedValue({
        items: students,
        total: 5,
      });

      const result = await controller.findAll({ role: 'student' });

      expect(mockUsersService.findAllPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'student' }),
      );
      expect(result.data).toHaveLength(5);
    });
  });

  describe('findOne', () => {
    it('returns a single user wrapped in data', async () => {
      const user = createMockUser({ id: 'uuid-1' });
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('uuid-1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toHaveProperty('data');
    });
  });

  describe('update', () => {
    it('updates and returns the updated user wrapped in data', async () => {
      const updated = createMockUser({ id: 'uuid-1', username: 'updatedname' });
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-1', {
        username: 'updatedname',
      });

      expect(mockUsersService.update).toHaveBeenCalledWith('uuid-1', {
        username: 'updatedname',
      });
      expect(result).toHaveProperty('data');
      expect(result.data.username).toBe('updatedname');
    });
  });

  describe('remove', () => {
    it('removes a user by id and returns wrapped in data', async () => {
      const user = createMockUser({ id: 'uuid-1' });
      mockUsersService.remove.mockResolvedValue(user);

      const result = await controller.remove('uuid-1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toHaveProperty('data');
    });
  });
});
