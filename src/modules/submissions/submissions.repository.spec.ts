import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsRepository } from './submissions.repository';
import { PrismaService } from '../../database/prisma.service';

const mockPrisma = {
  submission: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SubmissionsRepository', () => {
  let repository: SubmissionsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<SubmissionsRepository>(SubmissionsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
