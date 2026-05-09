-- AlterTable
ALTER TABLE "assignment_submissions" ADD COLUMN     "criteria_scores" JSONB;

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "grading_criteria" JSONB;
