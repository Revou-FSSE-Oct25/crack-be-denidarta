-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NO_FORMAL_EDUCATION', 'PRIMARY', 'SECONDARY', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL');

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "fullName" VARCHAR(255),
    "dateOfBirth" DATE,
    "gender" "Gender",
    "streetAddress" VARCHAR(500),
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "district" VARCHAR(100),
    "subdistrict" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "country" VARCHAR(100),
    "timezone" VARCHAR(100),
    "linkedinUrl" VARCHAR(500),
    "githubUrl" VARCHAR(500),
    "personalWebsite" VARCHAR(500),
    "shortBio" TEXT,
    "currentOccupation" VARCHAR(255),
    "company" VARCHAR(255),
    "highestEducation" "EducationLevel",
    "fieldOfStudy" VARCHAR(255),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
