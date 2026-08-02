-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTER');

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "payloadJson" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_otps_email_purpose_idx" ON "email_otps"("email", "purpose");

-- CreateIndex
CREATE INDEX "email_otps_expiresAt_idx" ON "email_otps"("expiresAt");
