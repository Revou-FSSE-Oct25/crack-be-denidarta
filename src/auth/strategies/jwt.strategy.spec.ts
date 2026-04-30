import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('returns the payload as-is', () => {
    const payload = { sub: 1, email: 'test@example.com', role: 'STUDENT' };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      sub: 1,
      email: 'test@example.com',
      role: 'STUDENT',
    });
  });
});
