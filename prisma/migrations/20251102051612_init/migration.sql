/*
  Warnings:

  - The primary key for the `ActivityLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `targetId` column on the `ActivityLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Analytics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `ootdId` column on the `Analytics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productId` column on the `Analytics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Influencer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OotdPost` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OotdProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The primary key for the `ProductPlatform` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `price` on the `ProductPlatform` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ootdId,productId]` on the table `OotdProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,platform]` on the table `ProductPlatform` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Analytics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `influencerId` on the `Analytics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Influencer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Influencer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `OotdPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `influencerId` on the `OotdPost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `OotdProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ootdId` on the `OotdProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `OotdProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `influencerId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `ProductPlatform` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `ProductPlatform` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authUserId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_influencerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_ootdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Influencer" DROP CONSTRAINT "Influencer_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OotdPost" DROP CONSTRAINT "OotdPost_influencerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OotdProduct" DROP CONSTRAINT "OotdProduct_ootdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OotdProduct" DROP CONSTRAINT "OotdProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_influencerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductPlatform" DROP CONSTRAINT "ProductPlatform_productId_fkey";

-- AlterTable
ALTER TABLE "public"."ActivityLog" DROP CONSTRAINT "ActivityLog_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "targetId",
ADD COLUMN     "targetId" UUID,
ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "influencerId",
ADD COLUMN     "influencerId" UUID NOT NULL,
DROP COLUMN "ootdId",
ADD COLUMN     "ootdId" UUID,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID,
ADD CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Influencer" DROP CONSTRAINT "Influencer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."OotdPost" DROP CONSTRAINT "OotdPost_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "influencerId",
ADD COLUMN     "influencerId" UUID NOT NULL,
ADD CONSTRAINT "OotdPost_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."OotdProduct" DROP CONSTRAINT "OotdProduct_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "ootdId",
ADD COLUMN     "ootdId" UUID NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL,
ADD CONSTRAINT "OotdProduct_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "influencerId",
ADD COLUMN     "influencerId" UUID NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."ProductPlatform" DROP CONSTRAINT "ProductPlatform_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "ProductPlatform_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "authUserId",
ADD COLUMN     "authUserId" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_timestamp_idx" ON "public"."ActivityLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_actionType_idx" ON "public"."ActivityLog"("actionType");

-- CreateIndex
CREATE INDEX "Analytics_influencerId_timestamp_idx" ON "public"."Analytics"("influencerId", "timestamp");

-- CreateIndex
CREATE INDEX "Analytics_event_timestamp_idx" ON "public"."Analytics"("event", "timestamp");

-- CreateIndex
CREATE INDEX "Analytics_productId_idx" ON "public"."Analytics"("productId");

-- CreateIndex
CREATE INDEX "Analytics_ootdId_idx" ON "public"."Analytics"("ootdId");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_userId_key" ON "public"."Influencer"("userId");

-- CreateIndex
CREATE INDEX "Influencer_isActive_idx" ON "public"."Influencer"("isActive");

-- CreateIndex
CREATE INDEX "Influencer_createdAt_idx" ON "public"."Influencer"("createdAt");

-- CreateIndex
CREATE INDEX "OotdPost_influencerId_createdAt_idx" ON "public"."OotdPost"("influencerId", "createdAt");

-- CreateIndex
CREATE INDEX "OotdPost_isPublic_idx" ON "public"."OotdPost"("isPublic");

-- CreateIndex
CREATE INDEX "OotdProduct_ootdId_idx" ON "public"."OotdProduct"("ootdId");

-- CreateIndex
CREATE INDEX "OotdProduct_productId_idx" ON "public"."OotdProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "OotdProduct_ootdId_productId_key" ON "public"."OotdProduct"("ootdId", "productId");

-- CreateIndex
CREATE INDEX "Product_influencerId_createdAt_idx" ON "public"."Product"("influencerId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "public"."Product"("category");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "ProductPlatform_productId_platform_idx" ON "public"."ProductPlatform"("productId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPlatform_productId_platform_key" ON "public"."ProductPlatform"("productId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "public"."User"("authUserId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Influencer" ADD CONSTRAINT "Influencer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OotdPost" ADD CONSTRAINT "OotdPost_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductPlatform" ADD CONSTRAINT "ProductPlatform_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OotdProduct" ADD CONSTRAINT "OotdProduct_ootdId_fkey" FOREIGN KEY ("ootdId") REFERENCES "public"."OotdPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OotdProduct" ADD CONSTRAINT "OotdProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "public"."Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_ootdId_fkey" FOREIGN KEY ("ootdId") REFERENCES "public"."OotdPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
