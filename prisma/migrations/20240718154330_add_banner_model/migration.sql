-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
