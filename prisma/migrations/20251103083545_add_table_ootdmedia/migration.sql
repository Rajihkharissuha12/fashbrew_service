/*
  Warnings:

  - You are about to drop the column `image` on the `OotdPost` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('image', 'video');

-- AlterTable
ALTER TABLE "public"."OotdPost" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "public"."OotdMedia" (
    "id" UUID NOT NULL,
    "ootdId" UUID NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OotdMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OotdMedia_ootdId_type_idx" ON "public"."OotdMedia"("ootdId", "type");

-- AddForeignKey
ALTER TABLE "public"."OotdMedia" ADD CONSTRAINT "OotdMedia_ootdId_fkey" FOREIGN KEY ("ootdId") REFERENCES "public"."OotdPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
