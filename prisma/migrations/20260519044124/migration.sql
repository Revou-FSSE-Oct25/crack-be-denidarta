/*
  Warnings:

  - The primary key for the `instructor_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `instructor_profiles` table. All the data in the column will be lost.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `profiles` table. All the data in the column will be lost.
  - The primary key for the `student_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `student_profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "instructor_profiles_user_id_key";

-- DropIndex
DROP INDEX "profiles_user_id_key";

-- DropIndex
DROP INDEX "student_profiles_user_id_key";

-- AlterTable
ALTER TABLE "instructor_profiles" DROP CONSTRAINT "instructor_profiles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("user_id");
