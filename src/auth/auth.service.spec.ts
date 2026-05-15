import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  setInviteToken: jest.fn(),
  findByInviteToken: jest.fn(),
  activateUser: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockPrismaService = {
  tokenPurge: { upsert: jest.fn() },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser', () => {
    it('returns user without password when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'student',
        status: 'active',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'student',
        status: 'active',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'no@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('correctpassword', 10),
        role: 'student',
        status: 'active',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('returns null when user is not active', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'student',
        status: 'invited',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {});

  describe('refresh', () => {});

  describe('generateInvite', () => {});

  describe('setPassword', () => {});
});
