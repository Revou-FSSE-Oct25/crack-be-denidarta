/*
  Warnings:

  - The primary key for the `assignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `assignment_submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `class_attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `class_session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `course_enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `learning_material` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `token_blacklist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submission" DROP CONSTRAINT "assignment_submission_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submission" DROP CONSTRAINT "assignment_submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "class_attendance" DROP CONSTRAINT "class_attendance_classSessionId_fkey";

-- DropForeignKey
ALTER TABLE "class_attendance" DROP CONSTRAINT "class_attendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "class_session" DROP CONSTRAINT "class_session_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "course_enrollment" DROP CONSTRAINT "course_enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_enrollment" DROP CONSTRAINT "course_enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "learning_material" DROP CONSTRAINT "learning_material_courseId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- AlterTable
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "assignment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "assignment_id_seq";

-- AlterTable
ALTER TABLE "assignment_submission" DROP CONSTRAINT "assignment_submission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "assignmentId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "assignment_submission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "assignment_submission_id_seq";

-- AlterTable
ALTER TABLE "class_attendance" DROP CONSTRAINT "class_attendance_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "classSessionId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "class_attendance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "class_attendance_id_seq";

-- AlterTable
ALTER TABLE "class_session" DROP CONSTRAINT "class_session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "class_session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "class_session_id_seq";

-- AlterTable
ALTER TABLE "course" DROP CONSTRAINT "course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "instructorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "course_id_seq";

-- AlterTable
ALTER TABLE "course_enrollment" DROP CONSTRAINT "course_enrollment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "course_enrollment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "course_enrollment_id_seq";

-- AlterTable
ALTER TABLE "learning_material" DROP CONSTRAINT "learning_material_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "courseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "learning_material_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "learning_material_id_seq";

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "profiles_id_seq";

-- AlterTable
ALTER TABLE "token_blacklist" DROP CONSTRAINT "token_blacklist_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "token_blacklist_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material" ADD CONSTRAINT "learning_material_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_session" ADD CONSTRAINT "class_session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "class_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
