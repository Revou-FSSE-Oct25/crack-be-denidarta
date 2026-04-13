import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Request } from 'express';

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
  generateInvite: jest.fn(),
  setPassword: jest.fn(),
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
        id: 1,
        email: 'test@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
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
    it('returns logged out message', () => {
      const result = controller.logout();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('generateInvite', () => {
    it('calls authService.generateInvite with userId and returns invite link', async () => {
      const userId = 1;
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
});
