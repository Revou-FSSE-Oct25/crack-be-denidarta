import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

const mockAuthService = {
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  setPassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

function makeRes() {
  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };
  return res as unknown as Response;
}

function makeReq(cookies: Record<string, string> = {}, user?: unknown) {
  return { cookies, user } as unknown as Request;
}

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
    it('calls authService.login with request.user, sets cookies, and returns access token', async () => {
      const user = {
        id: 'uuid-1',
        email: 'test@example.com',
        role: 'student',
        status: 'active',
      };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockAuthService.login.mockResolvedValue(tokens);

      const res = makeRes();
      const result = await controller.login(makeReq({}, user), res);

      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'access',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
      expect(result).toEqual({ accessToken: 'access' });
    });
  });

  describe('refresh', () => {
    it('reads refresh token from cookie, rotates tokens, sets new cookies', async () => {
      const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      mockAuthService.refresh.mockResolvedValue(tokens);

      const res = makeRes();
      const req = makeReq({ refresh_token: 'cookie-refresh' });
      const result = await controller.refresh(req, res, {});

      expect(mockAuthService.refresh).toHaveBeenCalledWith('cookie-refresh');
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'new-access',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'new-access' });
    });

    it('falls back to body token when cookie absent', async () => {
      const tokens = { accessToken: 'a', refreshToken: 'r' };
      mockAuthService.refresh.mockResolvedValue(tokens);

      const res = makeRes();
      await controller.refresh(makeReq({}), res, {
        refreshToken: 'body-refresh',
      });

      expect(mockAuthService.refresh).toHaveBeenCalledWith('body-refresh');
    });
  });

  describe('logout', () => {
    it('clears cookies and calls authService.logout with the cookie token', async () => {
      const response = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(response);

      const res = makeRes();
      const req = makeReq({ refresh_token: 'cookie-refresh' });
      const result = await controller.logout(req, res, {});

      expect(mockAuthService.logout).toHaveBeenCalledWith('cookie-refresh');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(Object),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(Object),
      );
      expect(result).toEqual(response);
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
  });

  describe('forgotPassword', () => {
    it('calls authService.forgotPassword with email and returns generic message', async () => {
      const dto = { email: 'user@test.com' };
      const response = {
        message:
          'If an account exists for this email, a reset link has been sent.',
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
