import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionRepository } from './class-sessions.repository';

const mockClassSessionsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClassSessionsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsService,
        {
          provide: ClassSessionRepository,
          useValue: mockClassSessionsRepository,
        },
      ],
    }).compile();

    const service: unknown = module.get(ClassSessionsService);
    expect(service).toBeInstanceOf(ClassSessionsService);
  });
});
