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
    it('returns paginated users when no role filter is provided', async () => {
      const users = createMockUserList(3);
      mockUsersService.findAllPaginated.mockResolvedValue([users, 3]);

      const result = await controller.findAll();

      expect(mockUsersService.findAllPaginated).toHaveBeenCalled();
      expect(result).toMatchObject({ data: users, total: 3 });
    });

    it('returns users filtered by role', async () => {
      const students = createMockUserList(5, { role: UserRole.STUDENT });
      mockUsersService.findByRole.mockResolvedValue(students);

      const result = await controller.findAll('STUDENT');

      expect(mockUsersService.findByRole).toHaveBeenCalledWith('STUDENT');
      expect(result).toEqual(students);
    });
  });

  describe('findOne', () => {
    it('returns a single user by id', async () => {
      const user = createMockUser({ id: 1 });
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('updates and returns the updated user', async () => {
      const updated = createMockUser({ id: 1, username: 'updatedname' });
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('1', { username: 'updatedname' });

      expect(mockUsersService.update).toHaveBeenCalledWith(1, {
        username: 'updatedname',
      });
      expect(result.username).toBe('updatedname');
    });
  });

  describe('remove', () => {
    it('removes a user by id', async () => {
      const user = createMockUser({ id: 1 });
      mockUsersService.remove.mockResolvedValue(user);

      const result = await controller.remove('1');

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });
});
