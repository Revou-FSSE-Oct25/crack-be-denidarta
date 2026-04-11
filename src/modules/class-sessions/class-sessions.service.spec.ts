import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionsRepository } from './class-sessions.repository';

const mockClassSessionsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ClassSessionsService', () => {
  let service: ClassSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsService,
        { provide: ClassSessionsRepository, useValue: mockClassSessionsRepository },
      ],
    }).compile();

    service = module.get<ClassSessionsService>(ClassSessionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
