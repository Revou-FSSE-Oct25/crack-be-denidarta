import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { SubmissionsRepository } from './submissions.repository';

const mockSubmissionsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: SubmissionsRepository, useValue: mockSubmissionsRepository },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  afterEach(() => jest.clearAllMocks());

  // Check subsission created succesfully
  describe('create', () => {});

  // All submission rendered,
  // Find all submission submitted by students.
  // Find all submission for sepecific assignment.
  // Find all submissions for specific course.
  describe('findAll', () => {});

  // Find specific submission
  describe('findOne', () => {});

  // Update submission data, submission status
  describe('update', () => {});

  // Soft delete submission, it will not be presented in all submission, but presist in database
  describe('remove', () => {});
});
