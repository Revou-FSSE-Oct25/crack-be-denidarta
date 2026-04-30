import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

const mockAttendancesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AttendancesController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [
        { provide: AttendancesService, useValue: mockAttendancesService },
      ],
    }).compile();

    const controller: unknown = module.get(AttendancesController);
    expect(controller).toBeInstanceOf(AttendancesController);
  });
});
