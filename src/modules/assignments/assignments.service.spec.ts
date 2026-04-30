import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { AssignmentRepository } from './assignments.repository';

const mockAssignmentRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AssignmentsService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: AssignmentRepository, useValue: mockAssignmentRepository },
      ],
    }).compile();

    const service: unknown = module.get(AssignmentsService);
    expect(service).toBeInstanceOf(AssignmentsService);
  });
});
