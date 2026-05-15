-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "company" VARCHAR(255),
ADD COLUMN     "current_occupation" VARCHAR(255),
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "field_of_study" VARCHAR(255),
ADD COLUMN     "highest_education" "EducationLevel",
ADD COLUMN     "postal_code" VARCHAR(20),
ADD COLUMN     "street_address" TEXT,
ADD COLUMN     "timezone" VARCHAR(100);
