/*
  Warnings:

  - The values [draft,returned] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubmissionStatus_new" AS ENUM ('notSubmitted', 'submitted', 'graded');

ALTER TABLE "assignment_submissions" ALTER COLUMN "status" DROP DEFAULT;

-- Use a CASE statement in the USING clause to map old values to new ones during the type conversion
ALTER TABLE "assignment_submissions" ALTER COLUMN "status" TYPE "SubmissionStatus_new"
USING (
  CASE
    WHEN "status"::text IN ('draft', 'returned') THEN 'notSubmitted'::"SubmissionStatus_new"
    ELSE "status"::text::"SubmissionStatus_new"
  END
);

ALTER TYPE "SubmissionStatus" RENAME TO "SubmissionStatus_old";
ALTER TYPE "SubmissionStatus_new" RENAME TO "SubmissionStatus";
DROP TYPE "SubmissionStatus_old";

ALTER TABLE "assignment_submissions" ALTER COLUMN "status" SET DEFAULT 'notSubmitted';
COMMIT;
