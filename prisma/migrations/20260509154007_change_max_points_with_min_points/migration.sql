/*
  Warnings:

  - You are about to drop the column `max_points` on the `assignments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "max_points",
ADD COLUMN     "min_points" DECIMAL(5,2) NOT NULL DEFAULT 0;
