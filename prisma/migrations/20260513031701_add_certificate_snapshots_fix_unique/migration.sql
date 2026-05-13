/*
  Warnings:

  - Added the required column `program_name_snapshot` to the `certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_name_snapshot` to the `certificates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "certificates_program_id_key";

-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "program_name_snapshot" VARCHAR(255) NOT NULL,
ADD COLUMN     "student_name_snapshot" VARCHAR(255) NOT NULL;
