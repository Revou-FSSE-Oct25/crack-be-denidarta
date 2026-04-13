import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

const mockAuthService = {
  validateUser: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns the user when credentials are valid', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      role: 'STUDENT',
      status: 'ACTIVE',
    };
    mockAuthService.validateUser.mockResolvedValue(user);

    const result = await strategy.validate('test@example.com', 'password123');

    expect(result).toEqual(user);
  });

  it('throws UnauthorizedException when credentials are invalid', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(strategy.validate('bad@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
