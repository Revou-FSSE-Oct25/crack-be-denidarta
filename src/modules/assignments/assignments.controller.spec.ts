import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

const mockAssignmentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AssignmentsController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        { provide: AssignmentsService, useValue: mockAssignmentsService },
      ],
    }).compile();

    const controller: unknown = module.get(AssignmentsController);
    expect(controller).toBeInstanceOf(AssignmentsController);
  });
});
