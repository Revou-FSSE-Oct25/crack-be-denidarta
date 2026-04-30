import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentRepository } from './enrollments.repository';

const mockEnrollmentsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EnrollmentsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: EnrollmentRepository, useValue: mockEnrollmentsRepository },
      ],
    }).compile();

    const service: unknown = module.get(EnrollmentsService);
    expect(service).toBeInstanceOf(EnrollmentsService);
  });
});
