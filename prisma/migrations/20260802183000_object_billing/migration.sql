-- CreateEnum
CREATE TYPE "ObjectLifecycle" AS ENUM ('ACTIVE', 'READ_ONLY', 'PENDING_DELETE', 'DELETED');

-- CreateEnum
CREATE TYPE "ObjectInvoiceKind" AS ENUM ('NEW_OBJECT', 'RENEWAL');

-- CreateTable
CREATE TABLE "objects" (
    "id" TEXT NOT NULL,
    "architectId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "lifecycle" "ObjectLifecycle" NOT NULL DEFAULT 'ACTIVE',
    "isFreeTrial" BOOLEAN NOT NULL DEFAULT false,
    "storageLimitBytes" BIGINT NOT NULL,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "paidUntil" TIMESTAMP(3) NOT NULL,
    "readOnlyAt" TIMESTAMP(3),
    "deleteAt" TIMESTAMP(3),
    "deleteWarnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_invoices" (
    "id" TEXT NOT NULL,
    "invId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "objectId" TEXT,
    "kind" "ObjectInvoiceKind" NOT NULL,
    "title" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "object_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "objects_architectId_idx" ON "objects"("architectId");

-- CreateIndex
CREATE INDEX "objects_clientId_idx" ON "objects"("clientId");

-- CreateIndex
CREATE INDEX "objects_paidUntil_idx" ON "objects"("paidUntil");

-- CreateIndex
CREATE UNIQUE INDEX "object_invoices_invId_key" ON "object_invoices"("invId");

-- CreateIndex
CREATE INDEX "object_invoices_userId_idx" ON "object_invoices"("userId");

-- CreateIndex
CREATE INDEX "object_invoices_objectId_idx" ON "object_invoices"("objectId");

-- AddForeignKey
ALTER TABLE "objects" ADD CONSTRAINT "objects_architectId_fkey" FOREIGN KEY ("architectId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objects" ADD CONSTRAINT "objects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_invoices" ADD CONSTRAINT "object_invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_invoices" ADD CONSTRAINT "object_invoices_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
