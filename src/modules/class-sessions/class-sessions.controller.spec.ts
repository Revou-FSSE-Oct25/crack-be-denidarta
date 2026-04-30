import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsController } from './class-sessions.controller';
import { ClassSessionsService } from './class-sessions.service';

const mockClassSessionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClassSessionsController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSessionsController],
      providers: [
        { provide: ClassSessionsService, useValue: mockClassSessionsService },
      ],
    }).compile();

    const controller: unknown = module.get(ClassSessionsController);
    expect(controller).toBeInstanceOf(ClassSessionsController);
  });
});
