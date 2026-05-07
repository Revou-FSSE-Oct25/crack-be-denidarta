-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "head_of_program_id" TEXT;

-- CreateIndex
CREATE INDEX "programs_created_by_idx" ON "programs"("created_by");

-- CreateIndex
CREATE INDEX "programs_head_of_program_id_idx" ON "programs"("head_of_program_id");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_head_of_program_id_fkey" FOREIGN KEY ("head_of_program_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
