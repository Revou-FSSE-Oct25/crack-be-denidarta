/*
  Warnings:

  - Made the column `program_id` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `started_at` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ended_at` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_program_id_fkey";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "program_id" SET NOT NULL,
ALTER COLUMN "started_at" SET NOT NULL,
ALTER COLUMN "ended_at" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
