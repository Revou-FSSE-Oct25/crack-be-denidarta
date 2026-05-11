-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'unverified';

-- AlterTable
ALTER TABLE "class_attendances" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
