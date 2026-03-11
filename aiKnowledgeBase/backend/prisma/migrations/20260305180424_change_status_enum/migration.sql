/*
  Warnings:

  - The values [Uploading,Processing] on the enum `FileStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileStatus_new" AS ENUM ('Uploaded', 'Processed', 'Embedded');
ALTER TABLE "public"."Document" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Document" ALTER COLUMN "status" TYPE "FileStatus_new" USING ("status"::text::"FileStatus_new");
ALTER TYPE "FileStatus" RENAME TO "FileStatus_old";
ALTER TYPE "FileStatus_new" RENAME TO "FileStatus";
DROP TYPE "public"."FileStatus_old";
ALTER TABLE "Document" ALTER COLUMN "status" SET DEFAULT 'Uploaded';
COMMIT;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "status" SET DEFAULT 'Uploaded';
