import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentRepository } from './enrollments.repository';

const mockEnrollmentsRepository = {
  create: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByUserId: jest.fn(),
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: EnrollmentRepository, useValue: mockEnrollmentsRepository },
      ],
    }).compile();
    service = module.get(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeInstanceOf(EnrollmentsService);
  });

  it('findOne throws NotFoundException when absent', async () => {
    mockEnrollmentsRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns paginated envelope', async () => {
    mockEnrollmentsRepository.findAllPaginated.mockResolvedValue([
      [
        {
          id: '1',
          userId: 'u1',
          programId: 'p1',
          status: 'active',
          enrolledAt: new Date(),
          user: null,
          program: null,
        },
      ],
      1,
    ]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result.meta.total).toBe(1);
  });
});
