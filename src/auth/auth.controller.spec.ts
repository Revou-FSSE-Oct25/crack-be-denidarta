import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Request } from 'express';

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  generateInvite: jest.fn(),
  setPassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('calls authService.login with request.user and returns tokens', async () => {
      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        role: 'student',
        status: 'active',
      };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login({ user } as unknown as Request);

      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(tokens);
    });
  });

  describe('refresh', () => {
    it('calls authService.refresh with refreshToken and returns new tokens', async () => {
      const dto = { refreshToken: 'valid-refresh-token' };
      const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      mockAuthService.refresh.mockResolvedValue(tokens);

      const result = await controller.refresh(dto);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('calls authService.logout with refreshToken and returns logged out message', async () => {
      const dto = { refreshToken: 'valid-refresh-token' };
      const response = { message: 'Logged out successfully' };
      mockAuthService.logout = jest.fn().mockResolvedValue(response);

      const result = await controller.logout(dto);

      expect(mockAuthService.logout).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toEqual(response);
    });
  });

  describe('generateInvite', () => {
    it('calls authService.generateInvite with userId and returns invite link', async () => {
      const userId = 'uuid-1';
      const inviteLink = { inviteLink: 'https://example.com/invite/token123' };
      mockAuthService.generateInvite.mockResolvedValue(inviteLink);

      const result = await controller.generateInvite(userId);

      expect(mockAuthService.generateInvite).toHaveBeenCalledWith(userId);
      expect(result).toEqual(inviteLink);
    });
  });

  describe('setPassword', () => {
    it('calls authService.setPassword with inviteToken and password', async () => {
      const dto = {
        inviteToken: '550e8400-e29b-41d4-a716-446655440000',
        password: 'newpassword123',
      };
      const response = { message: 'Password set successfully' };
      mockAuthService.setPassword.mockResolvedValue(response);

      const result = await controller.setPassword(dto);

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it('requires a valid inviteToken (UUID) to set password', async () => {
      const dto = {
        inviteToken: '550e8400-e29b-41d4-a716-446655440000',
        password: 'newpassword123',
      };
      mockAuthService.setPassword.mockResolvedValue({
        message: 'Password set successfully',
      });

      await controller.setPassword(dto);

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(
        expect.objectContaining({ inviteToken: dto.inviteToken }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('calls authService.forgotPassword with email and returns token', async () => {
      const dto = { email: 'user@test.com' };
      const response = {
        resetToken: '00000000-0000-0000-0000-000000000003',
        expiresAt: new Date(),
      };
      mockAuthService.forgotPassword.mockResolvedValue(response);

      const result = await controller.forgotPassword(dto);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual(response);
    });
  });

  describe('resetPassword', () => {
    it('calls authService.resetPassword with dto and returns success message', async () => {
      const dto = {
        resetToken: '00000000-0000-0000-0000-000000000003',
        password: 'newpass123',
      };
      const response = { message: 'Password reset successfully.' };
      mockAuthService.resetPassword.mockResolvedValue(response);

      const result = await controller.resetPassword(dto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });
});
