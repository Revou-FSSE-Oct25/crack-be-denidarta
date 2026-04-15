import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

function createMockContext(role: string | undefined, handlerRoles: UserRole[]) {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(handlerRoles);

  const mockContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  };

  return { guard, mockContext };
}

describe('RolesGuard', () => {
  afterEach(() => jest.restoreAllMocks());

  it('allows access when no roles are required', () => {
    const { guard, mockContext } = createMockContext('STUDENT', []);
    expect(guard.canActivate(mockContext as any)).toBe(true);
  });

  it('allows access when user has the required role', () => {
    const { guard, mockContext } = createMockContext('ADMIN', [UserRole.ADMIN]);
    expect(guard.canActivate(mockContext as any)).toBe(true);
  });

  it('throws ForbiddenException when user role does not match', () => {
    const { guard, mockContext } = createMockContext('STUDENT', [
      UserRole.ADMIN,
    ]);
    expect(() => guard.canActivate(mockContext as any)).toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when user is not authenticated', () => {
    const { guard, mockContext } = createMockContext(undefined, [
      UserRole.ADMIN,
    ]);
    expect(() => guard.canActivate(mockContext as any)).toThrow(
      ForbiddenException,
    );
  });
});
