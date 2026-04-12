import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
      const user = { id: 1, email: 'test@example.com', role: 'STUDENT', status: 'ACTIVE' };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login({ user } as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual(tokens);
    });
  });

  describe('refresh', () => {});

  describe('logout', () => {});

  describe('generateInvite', () => {});

  describe('setPassword', () => {});
});
