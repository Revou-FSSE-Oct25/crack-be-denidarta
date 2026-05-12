/*
  Warnings:

  - You are about to drop the column `course_id` on the `certificates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[program_id]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,program_id]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `program_id` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_course_id_fkey";

-- DropIndex
DROP INDEX "certificates_user_id_course_id_key";

-- AlterTable
ALTER TABLE "certificates" DROP COLUMN "course_id",
ADD COLUMN     "program_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "certificates_program_id_key" ON "certificates"("program_id");

-- CreateIndex
CREATE INDEX "certificates_user_id_idx" ON "certificates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_user_id_program_id_key" ON "certificates"("user_id", "program_id");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
