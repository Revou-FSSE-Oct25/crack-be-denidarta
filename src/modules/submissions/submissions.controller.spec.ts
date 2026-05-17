import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { DataPoliciesGuard } from '../../common/guards/DataPolicies.guard';

const mockSubmissionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const defaultQuery: PaginationQueryDto = { page: 1, limit: 10 };

describe('SubmissionsController', () => {
  let controller: SubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    })
      .overrideGuard(DataPoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {
    const mockUser: JwtPayload = {
      sub: 'user-1',
      role: UserRole.admin,
      email: 'user1@example.com',
    };

    it('returns all submissions when no filter is provided', async () => {
      const paginated = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockSubmissionsService.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockUser, defaultQuery);

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        { studentId: undefined, assignmentId: undefined, courseId: undefined },
        defaultQuery,
        mockUser,
      );
      expect(result).toEqual(paginated);
    });

    it('returns submissions filtered by studentId', async () => {
      const paginated = {
        data: [],
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
      };
      mockSubmissionsService.findAll.mockResolvedValue(paginated);

      await controller.findAll(mockUser, defaultQuery, '3');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        { studentId: '3', assignmentId: undefined, courseId: undefined },
        defaultQuery,
        mockUser,
      );
    });

    it('returns submissions filtered by assignmentId', async () => {
      mockSubmissionsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(mockUser, defaultQuery, undefined, '5');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        { studentId: undefined, assignmentId: '5', courseId: undefined },
        defaultQuery,
        mockUser,
      );
    });

    it('returns submissions filtered by courseId', async () => {
      mockSubmissionsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(
        mockUser,
        defaultQuery,
        undefined,
        undefined,
        '2',
      );

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        { studentId: undefined, assignmentId: undefined, courseId: '2' },
        defaultQuery,
        mockUser,
      );
    });
  });

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
