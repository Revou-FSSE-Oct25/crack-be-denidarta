/*
  Warnings:

  - The values [DRAFT,PUBLISHED,CLOSED] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRESENT,ABSENT,LATE,EXCUSED] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT,ACTIVE,ARCHIVED,COMPLETED] on the enum `CourseStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [NO_FORMAL_EDUCATION,PRIMARY,SECONDARY,VOCATIONAL,ASSOCIATE,BACHELOR,MASTER,DOCTORATE,PROFESSIONAL] on the enum `EducationLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,ENROLLED,COMPLETED,DROPPED] on the enum `EnrollmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MALE,FEMALE,OTHER,PREFER_NOT_TO_SAY] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [VIDEO,PDF,ARTICLE,SLIDES,OTHER] on the enum `MaterialType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT,SUBMITTED,GRADED,RETURNED] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [STUDENT,INSTRUCTOR,ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `company` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `currentOccupation` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `fieldOfStudy` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `highestEducation` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `personalWebsite` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `shortBio` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `token_blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `token_blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `inviteToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `inviteTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assignment_submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_material` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `token_blacklist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('active', 'inactive', 'graduated', 'dropped_out', 'on_leave');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
ALTER TABLE "profiles" ALTER COLUMN "gender" TYPE "Gender_new" USING (LOWER("gender"::text)::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('student', 'instructor', 'admin');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (LOWER("role"::text)::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

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

-- DropIndex
DROP INDEX "profiles_userId_key";

-- DropIndex
DROP INDEX "users_inviteToken_key";

-- AlterTable profiles: drop columns first
ALTER TABLE "profiles"
DROP COLUMN "company",
DROP COLUMN "currentOccupation",
DROP COLUMN "dateOfBirth",
DROP COLUMN "deletedAt",
DROP COLUMN "fieldOfStudy",
DROP COLUMN "highestEducation",
DROP COLUMN "postalCode",
DROP COLUMN "timezone";

-- AlterTable profiles: rename columns (must be separate statements in PostgreSQL)
ALTER TABLE "profiles" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "profiles" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "profiles" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "profiles" RENAME COLUMN "fullName" TO "full_name";
ALTER TABLE "profiles" RENAME COLUMN "githubUrl" TO "github";
ALTER TABLE "profiles" RENAME COLUMN "linkedinUrl" TO "linkedin";
ALTER TABLE "profiles" RENAME COLUMN "personalWebsite" TO "personal_website";
ALTER TABLE "profiles" RENAME COLUMN "shortBio" TO "short_bio";
ALTER TABLE "profiles" RENAME COLUMN "streetAddress" TO "full_address";

-- AlterTable profiles: add columns and change types/defaults
ALTER TABLE "profiles"
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "instagram" VARCHAR(255),
ADD COLUMN     "phone_number" VARCHAR(20),
ALTER COLUMN "full_address" TYPE TEXT,
ALTER COLUMN "github" TYPE VARCHAR(255),
ALTER COLUMN "linkedin" TYPE TEXT,
ALTER COLUMN "personal_website" TYPE TEXT,
ALTER COLUMN "country" SET DEFAULT 'Indonesia';

-- AlterTable
ALTER TABLE "token_blacklist"
RENAME COLUMN "createdAt" TO "created_at";

-- Rename separately so Postgres does not need a table rewrite for a required column.
ALTER TABLE "token_blacklist"
RENAME COLUMN "expiresAt" TO "expires_at";

-- AlterTable
ALTER TABLE "users"
RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "users"
RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "users"
RENAME COLUMN "deletedAt" TO "deleted_at";

ALTER TABLE "users"
RENAME COLUMN "password" TO "password_hash";

ALTER TABLE "users"
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

UPDATE "users"
SET "is_active" = CASE
    WHEN "status" = 'ACTIVE' THEN true
    ELSE false
END;

ALTER TABLE "users" DROP COLUMN "inviteToken",
DROP COLUMN "inviteTokenExpiresAt",
DROP COLUMN "status",
ALTER COLUMN "role" SET DEFAULT 'student';

-- DropTable
DROP TABLE "assignment";

-- DropTable
DROP TABLE "assignment_submission";

-- DropTable
DROP TABLE "class_attendance";

-- DropTable
DROP TABLE "class_session";

-- DropTable
DROP TABLE "course";

-- DropTable
DROP TABLE "course_enrollment";

-- DropTable
DROP TABLE "learning_material";

-- Recreate enums after all tables/columns that still use the old variants are gone.
DROP TYPE "AssignmentStatus";
DROP TYPE "AttendanceStatus";
DROP TYPE "CourseStatus";
DROP TYPE "EducationLevel";
DROP TYPE "EnrollmentStatus";
DROP TYPE "MaterialType";
DROP TYPE "SubmissionStatus";

CREATE TYPE "AssignmentStatus" AS ENUM ('draft', 'published', 'closed');
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'active', 'archived', 'completed');
CREATE TYPE "EducationLevel" AS ENUM ('high_school', 'diploma', 'bachelor', 'master', 'doctorate', 'other');
CREATE TYPE "EnrollmentStatus" AS ENUM ('pending', 'enrolled', 'completed', 'dropped');
CREATE TYPE "MaterialType" AS ENUM ('video', 'pdf', 'article', 'slides', 'other');
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'graded', 'returned');

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "nim" VARCHAR(50) NOT NULL,
    "enrollment_year" SMALLINT NOT NULL,
    "major" VARCHAR(255) NOT NULL,
    "faculty" VARCHAR(255),
    "current_semester" SMALLINT,
    "gpa" DECIMAL(3,2),
    "academic_status" "AcademicStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50) NOT NULL,
    "specialization" VARCHAR(255),
    "department" VARCHAR(255),
    "highest_education" "EducationLevel",
    "education_major" VARCHAR(255),
    "company" VARCHAR(255),
    "company_website" TEXT,
    "current_occupation" VARCHAR(255),
    "years_of_experience" SMALLINT,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "name" VARCHAR(255) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "program_id" TEXT,
    "instructor_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "started_at" TIMESTAMP(3),
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cert_number" VARCHAR(100) NOT NULL,
    "file_url" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_materials" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "course_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "file_url" TEXT,
    "material_type" "MaterialType" NOT NULL,
    "order_index" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "session_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "location" VARCHAR(255),
    "meeting_url" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_attendances" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "class_session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'present',
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,

    CONSTRAINT "class_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "course_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "max_points" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "submission_text" TEXT,
    "file_url" TEXT,
    "submitted_at" TIMESTAMP(3),
    "grade" DECIMAL(5,2),
    "passed" BOOLEAN,
    "feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_nim_key" ON "student_profiles"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_user_id_key" ON "instructor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_employee_id_key" ON "instructor_profiles"("employee_id");

-- CreateIndex
CREATE INDEX "courses_instructor_id_idx" ON "courses"("instructor_id");

-- CreateIndex
CREATE INDEX "courses_program_id_idx" ON "courses"("program_id");

-- CreateIndex
CREATE INDEX "course_enrollments_user_id_idx" ON "course_enrollments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_course_id_user_id_key" ON "course_enrollments"("course_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_cert_number_key" ON "certificates"("cert_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_user_id_course_id_key" ON "certificates"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "learning_materials_course_id_idx" ON "learning_materials"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_materials_course_id_order_index_key" ON "learning_materials"("course_id", "order_index");

-- CreateIndex
CREATE INDEX "class_sessions_course_id_idx" ON "class_sessions"("course_id");

-- CreateIndex
CREATE INDEX "class_sessions_session_date_idx" ON "class_sessions"("session_date");

-- CreateIndex
CREATE UNIQUE INDEX "class_attendances_class_session_id_user_id_key" ON "class_attendances"("class_session_id", "user_id");

-- CreateIndex
CREATE INDEX "assignments_course_id_idx" ON "assignments"("course_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_user_id_idx" ON "assignment_submissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_user_id_key" ON "assignment_submissions"("assignment_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_materials" ADD CONSTRAINT "learning_materials_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_materials" ADD CONSTRAINT "learning_materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendances" ADD CONSTRAINT "class_attendances_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "class_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendances" ADD CONSTRAINT "class_attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendances" ADD CONSTRAINT "class_attendances_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
