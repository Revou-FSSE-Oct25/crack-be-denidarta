import { DataPoliciesGuard } from './DataPolicies.guard';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

const mockPrisma = {
  assignmentSubmission: {
    findUnique: jest.fn(),
  },
};

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

function makeContext(userId: string, role: UserRole, paramId: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { sub: userId, role },
        params: { id: paramId },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('DataPoliciesGuard', () => {
  let guard: DataPoliciesGuard;

  beforeEach(() => {
    guard = new DataPoliciesGuard(mockPrisma as any, mockReflector as any);
    jest.clearAllMocks();
  });

  it('passes through when no ResourceOwner decorator present', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const result = await guard.canActivate(
      makeContext('u1', UserRole.student, 'sub1'),
    );
    expect(result).toBe(true);
  });

  it('passes through for non-student roles', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('id');
    const result = await guard.canActivate(
      makeContext('u1', UserRole.admin, 'sub1'),
    );
    expect(result).toBe(true);
    expect(mockPrisma.assignmentSubmission.findUnique).not.toHaveBeenCalled();
  });

  it('allows student who owns submission', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('id');
    mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({
      studentId: 'u1',
    });
    const result = await guard.canActivate(
      makeContext('u1', UserRole.student, 'sub1'),
    );
    expect(result).toBe(true);
  });

  it('throws ForbiddenException for student accessing others submission', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('id');
    mockPrisma.assignmentSubmission.findUnique.mockResolvedValue({
      studentId: 'u2',
    });
    await expect(
      guard.canActivate(makeContext('u1', UserRole.student, 'sub1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('passes through when submission not found (let service handle 404)', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('id');
    mockPrisma.assignmentSubmission.findUnique.mockResolvedValue(null);
    const result = await guard.canActivate(
      makeContext('u1', UserRole.student, 'sub1'),
    );
    expect(result).toBe(true);
  });
});
