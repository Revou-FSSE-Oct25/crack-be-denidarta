import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

const mockEnrollmentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EnrollmentsController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
      ],
    }).compile();

    const controller: unknown = module.get(EnrollmentsController);
    expect(controller).toBeInstanceOf(EnrollmentsController);
  });
});
