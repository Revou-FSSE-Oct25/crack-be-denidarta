import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  setInviteToken: jest.fn(),
  setResetToken: jest.fn(),
  findByInviteToken: jest.fn(),
  findByResetToken: jest.fn(),
  activateUser: jest.fn(),
  resetUserPassword: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockPrismaService = {
  tokenPurge: { upsert: jest.fn(), findUnique: jest.fn() },
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

  describe('forgotPassword', () => {
    const genericMessage =
      'If an account exists for this email, a reset link has been sent.';

    it('issues a reset token and returns a generic message for an active user', async () => {
      const user = { id: 'uuid-1', email: 'user@test.com', status: 'active' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.setResetToken.mockResolvedValue(undefined);

      const result = await service.forgotPassword('user@test.com');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'user@test.com',
      );
      expect(mockUsersService.setResetToken).toHaveBeenCalledWith(
        'uuid-1',
        expect.any(String),
        expect.any(Date),
      );
      // Response must not leak the token — it is sent only via email.
      expect(result).toEqual({ message: genericMessage });
      expect(result).not.toHaveProperty('resetToken');
    });

    it('returns the same generic message when email is unknown (no enumeration)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nobody@test.com');

      expect(result).toEqual({ message: genericMessage });
      expect(mockUsersService.setResetToken).not.toHaveBeenCalled();
    });

    it('returns the same generic message when user is not active', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'uuid-1',
        status: 'invited',
      });

      const result = await service.forgotPassword('user@test.com');

      expect(result).toEqual({ message: genericMessage });
      expect(mockUsersService.setResetToken).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const validToken = '00000000-0000-0000-0000-000000000003';

    it('resets password and clears token for active user with valid token', async () => {
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const user = {
        id: 'uuid-1',
        status: 'active',
        resetTokenExpiresAt,
      };
      mockUsersService.findByResetToken.mockResolvedValue(user);
      mockUsersService.resetUserPassword.mockResolvedValue(undefined);

      const result = await service.resetPassword({
        resetToken: validToken,
        password: 'newpass123',
      });

      expect(mockUsersService.findByResetToken).toHaveBeenCalledWith(
        validToken,
      );
      expect(mockUsersService.resetUserPassword).toHaveBeenCalledWith(
        'uuid-1',
        expect.any(String),
      );
      expect(result).toEqual({ message: 'Password reset successfully.' });
    });

    it('throws BadRequestException when token not found', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          resetToken: validToken,
          password: 'newpass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when user is not active', async () => {
      mockUsersService.findByResetToken.mockResolvedValue({
        id: 'uuid-1',
        status: 'invited',
        resetTokenExpiresAt: new Date(Date.now() + 3600_000),
      });

      await expect(
        service.resetPassword({
          resetToken: validToken,
          password: 'newpass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token is expired', async () => {
      mockUsersService.findByResetToken.mockResolvedValue({
        id: 'uuid-1',
        status: 'active',
        resetTokenExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword({
          resetToken: validToken,
          password: 'newpass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
