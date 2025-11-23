-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'influencer');

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('login', 'create_ootd', 'update_ootd', 'delete_ootd', 'create_product', 'update_profile', 'click_affiliate');

-- CreateEnum
CREATE TYPE "public"."TargetType" AS ENUM ('ootd', 'product', 'profile', 'system');

-- CreateEnum
CREATE TYPE "public"."PlatformType" AS ENUM ('tiktok', 'shopee', 'tokopedia', 'other');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('click', 'view', 'conversion');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Influencer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "banner" TEXT,
    "socialLinks" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OotdPost" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "mood" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OotdPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" TEXT,
    "tags" JSONB,
    "image" TEXT,
    "affiliateLink" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductPlatform" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" "public"."PlatformType" NOT NULL,
    "price" DOUBLE PRECISION,
    "link" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3),

    CONSTRAINT "ProductPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OotdProduct" (
    "id" TEXT NOT NULL,
    "ootdId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "note" TEXT,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OotdProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "public"."ActionType" NOT NULL,
    "targetId" TEXT,
    "targetType" "public"."TargetType",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analytics" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "ootdId" TEXT,
    "productId" TEXT,
    "platform" TEXT,
    "event" "public"."EventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "public"."User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_userId_key" ON "public"."Influencer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_handle_key" ON "public"."Influencer"("handle");

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
