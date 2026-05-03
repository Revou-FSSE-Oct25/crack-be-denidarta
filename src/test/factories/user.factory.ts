import { UserRole, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

interface MockUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: UserRole.student,
    status: UserStatus.active,
    createdAt: faker.date.past(),
    ...overrides,
  };
}

export function createMockUserList(
  count: number,
  overrides: Partial<MockUser> = {},
): MockUser[] {
  return Array.from({ length: count }, () => createMockUser(overrides));
}
