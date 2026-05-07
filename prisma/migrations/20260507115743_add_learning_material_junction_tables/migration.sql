/*
  Warnings:

  - You are about to drop the column `course_id` on the `learning_materials` table. All the data in the column will be lost.
  - You are about to drop the column `order_index` on the `learning_materials` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "learning_materials" DROP CONSTRAINT "learning_materials_course_id_fkey";

-- DropIndex
DROP INDEX "learning_materials_course_id_idx";

-- DropIndex
DROP INDEX "learning_materials_course_id_order_index_key";

-- AlterTable
ALTER TABLE "learning_materials" DROP COLUMN "course_id",
DROP COLUMN "order_index";

-- CreateTable
CREATE TABLE "learning_material_courses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "learning_material_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "order_index" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "learning_material_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_material_programs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "learning_material_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "order_index" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "learning_material_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_material_courses_course_id_idx" ON "learning_material_courses"("course_id");

-- CreateIndex
CREATE INDEX "learning_material_courses_learning_material_id_idx" ON "learning_material_courses"("learning_material_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_material_courses_learning_material_id_course_id_key" ON "learning_material_courses"("learning_material_id", "course_id");

-- CreateIndex
CREATE INDEX "learning_material_programs_program_id_idx" ON "learning_material_programs"("program_id");

-- CreateIndex
CREATE INDEX "learning_material_programs_learning_material_id_idx" ON "learning_material_programs"("learning_material_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_material_programs_learning_material_id_program_id_key" ON "learning_material_programs"("learning_material_id", "program_id");

-- CreateIndex
CREATE INDEX "learning_materials_uploaded_by_idx" ON "learning_materials"("uploaded_by");

-- AddForeignKey
ALTER TABLE "learning_material_courses" ADD CONSTRAINT "learning_material_courses_learning_material_id_fkey" FOREIGN KEY ("learning_material_id") REFERENCES "learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material_courses" ADD CONSTRAINT "learning_material_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material_programs" ADD CONSTRAINT "learning_material_programs_learning_material_id_fkey" FOREIGN KEY ("learning_material_id") REFERENCES "learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_material_programs" ADD CONSTRAINT "learning_material_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
