/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "inviteTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "password" VARCHAR(255),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'INVITED';

-- CreateIndex
CREATE UNIQUE INDEX "users_inviteToken_key" ON "users"("inviteToken");
