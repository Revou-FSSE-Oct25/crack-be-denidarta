import { Course, User } from '@prisma/client';

export type CourseWithInstructorAndProgram = Course & {
  instructor: (User & { profile: { fullName: string | null } | null }) | null;
  program: { name: string } | null;
};
