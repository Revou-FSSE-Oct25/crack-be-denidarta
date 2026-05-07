/*
  Warnings:

  - You are about to drop the column `user_id` on the `assignment_submissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignment_id,student_id]` on the table `assignment_submissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `assignment_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_user_id_fkey";

-- DropIndex
DROP INDEX "assignment_submissions_assignment_id_user_id_key";

-- DropIndex
DROP INDEX "assignment_submissions_user_id_idx";

-- AlterTable
ALTER TABLE "assignment_submissions" DROP COLUMN "user_id",
ADD COLUMN     "graded_at" TIMESTAMP(3),
ADD COLUMN     "graded_by" TEXT,
ADD COLUMN     "student_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_graded_by_idx" ON "assignment_submissions"("graded_by");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key" ON "assignment_submissions"("assignment_id", "student_id");

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
