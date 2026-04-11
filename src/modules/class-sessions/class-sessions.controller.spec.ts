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
  let controller: ClassSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSessionsController],
      providers: [{ provide: ClassSessionsService, useValue: mockClassSessionsService }],
    }).compile();

    controller = module.get<ClassSessionsController>(ClassSessionsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
