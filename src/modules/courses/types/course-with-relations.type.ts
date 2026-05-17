import { Course } from '@prisma/client';

export type CourseWithInstructorAndProgram = Course & {
  instructor: {
    id: string;
    profile: { fullName: string | null } | null;
  } | null;
  program: { name: string } | null;
};
