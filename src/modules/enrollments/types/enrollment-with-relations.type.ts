import {
  ProgramEnrollment,
  User,
  Profile,
  Program,
  Course,
  CourseStatus,
} from '@prisma/client';

export type UserWithProfile = User & {
  profile?: Profile | null;
};

export type CourseWithInstructor = Course & {
  instructor?: UserWithProfile | null;
  status: CourseStatus;
};

export type ProgramWithHeadOfProgramAndCourses = Program & {
  headOfProgram?: UserWithProfile | null;
  courses?: CourseWithInstructor[];
};

export type EnrollmentWithRelations = ProgramEnrollment & {
  user?: UserWithProfile | null;
  program?: ProgramWithHeadOfProgramAndCourses | null;
};
