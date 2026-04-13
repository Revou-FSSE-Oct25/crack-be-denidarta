import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';

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

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
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
        password: await require('bcrypt').hash('password123', 10),
        role: 'STUDENT',
        status: 'ACTIVE',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      });
      expect(result).not.toHaveProperty('password');
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
        password: await require('bcrypt').hash('correctpassword', 10),
        role: 'STUDENT',
        status: 'ACTIVE',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('returns null when user is not ACTIVE', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await require('bcrypt').hash('password123', 10),
        role: 'STUDENT',
        status: 'INVITED',
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
