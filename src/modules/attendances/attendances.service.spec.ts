import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from './attendances.service';
import { AttendanceRepository } from './attendances.repository';

const mockAttendanceRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AttendancesService', () => {
  let service: AttendancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: AttendanceRepository, useValue: mockAttendanceRepository },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {});

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
