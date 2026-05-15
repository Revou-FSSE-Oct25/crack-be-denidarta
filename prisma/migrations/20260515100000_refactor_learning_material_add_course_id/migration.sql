-- Step 1: Add course_id as nullable to allow backfill
ALTER TABLE "learning_materials" ADD COLUMN "course_id" TEXT;

-- Step 2: Backfill course_id from the first course assignment in learning_material_courses
UPDATE "learning_materials" lm
SET "course_id" = (
    SELECT lmc."course_id"
    FROM "learning_material_courses" lmc
    WHERE lmc."learning_material_id" = lm."id"
    ORDER BY lmc."created_at" ASC
    LIMIT 1
);

-- Step 3: Delete any learning materials that had no course assignment (orphaned)
DELETE FROM "learning_materials" WHERE "course_id" IS NULL;

-- Step 4: Make course_id NOT NULL
ALTER TABLE "learning_materials" ALTER COLUMN "course_id" SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE "learning_materials" ADD CONSTRAINT "learning_materials_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Add index on course_id
CREATE INDEX "learning_materials_course_id_idx" ON "learning_materials"("course_id");

-- Step 7: Drop junction tables
DROP TABLE "learning_material_courses";
DROP TABLE "learning_material_programs";
