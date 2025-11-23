/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `OotdPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."OotdPost" ADD COLUMN     "number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OotdPost_number_key" ON "public"."OotdPost"("number");
