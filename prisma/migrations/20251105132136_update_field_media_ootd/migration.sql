/*
  Warnings:

  - Added the required column `optimizedSize` to the `OotdMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalSize` to the `OotdMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlpublicid` to the `OotdMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OotdMedia" ADD COLUMN     "optimizedSize" INTEGER NOT NULL,
ADD COLUMN     "originalSize" INTEGER NOT NULL,
ADD COLUMN     "urlpublicid" TEXT NOT NULL;
