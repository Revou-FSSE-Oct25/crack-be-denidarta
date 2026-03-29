import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './users.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
};

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repo = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call prisma.user.create with dto', async () => {
      const dto = { username: 'alice', email: 'alice@test.com' };
      mockPrisma.user.create.mockResolvedValue({ id: 1, ...dto });

      const result = await repo.create(dto as any);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should call prisma.user.findMany filtering out soft-deleted users', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await repo.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should call prisma.user.findUnique with id', async () => {
      const user = { id: 1, email: 'alice@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await repo.findOne(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(user);
    });

    it('should return null when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should call prisma.user.findUnique with email', async () => {
      const user = { id: 1, email: 'alice@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await repo.findByEmail('alice@test.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@test.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when email is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findByInviteToken', () => {
    it('should call prisma.user.findUnique with inviteToken', async () => {
      const token = '00000000-0000-0000-0000-000000000001';
      const user = { id: 1, inviteToken: token };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await repo.findByInviteToken(token);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { inviteToken: token },
      });
      expect(result).toEqual(user);
    });

    it('should return null when token is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repo.findByInviteToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should call prisma.user.update with id and dto', async () => {
      const dto = { username: 'alice-updated' };
      const updated = { id: 1, ...dto };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await repo.update(1, dto as any);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
      expect(result).toEqual(updated);
    });
  });

  // describe('remove', () => {
  //   it('should soft-delete user by setting deletedAt', async () => {
  //     mockPrisma.user.update.mockResolvedValue({
  //       id: 1,
  //       deletedAt: new Date(),
  //     });

  //     await repo.remove(1);

  //     expect(mockPrisma.user.update).toHaveBeenCalledWith({
  //       where: { id: 1 },
  //       data: { deletedAt: expect.any(Date) },
  //     });
  //   });
  // });

  describe('setInviteToken', () => {
    it('should update user with invite token and INVITED status', async () => {
      const token = '00000000-0000-0000-0000-000000000001';
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      mockPrisma.user.update.mockResolvedValue({
        id: 1,
        inviteToken: token,
        status: 'INVITED',
      });

      await repo.inviteUser(1, token, expiresAt);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          inviteToken: token,
          inviteTokenExpiresAt: expiresAt,
          status: 'INVITED',
        },
      });
    });
  });

  describe('activateUser', () => {
    it('should set password, status ACTIVE, and clear invite token fields', async () => {
      const hash = '$2b$10$hashedpassword';
      mockPrisma.user.update.mockResolvedValue({ id: 1, status: 'ACTIVE' });

      await repo.activateUser(1, hash);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          password: hash,
          status: 'ACTIVE',
          inviteToken: null,
          inviteTokenExpiresAt: null,
        },
      });
    });
  });
});
