/*
  Warnings:

  - Added the required column `mysteryBoxAllowlistId` to the `MysteryBoxTrigger` table without a default value. This is not possible if the table is not empty.
  - Made the column `mysteryBoxId` on table `MysteryBoxTrigger` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MysteryBoxTrigger" DROP CONSTRAINT "MysteryBoxTrigger_mysteryBoxId_fkey";

-- AlterTable
ALTER TABLE "MysteryBoxTrigger" ADD COLUMN     "mysteryBoxAllowlistId" TEXT NOT NULL,
ALTER COLUMN "mysteryBoxId" SET NOT NULL;

-- CreateTable
CREATE TABLE "MysteryBoxAllowlist" (
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT,

    CONSTRAINT "MysteryBoxAllowlist_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxAllowlist_address_key" ON "MysteryBoxAllowlist"("address");

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_mysteryBoxAllowlistId_fkey" FOREIGN KEY ("mysteryBoxAllowlistId") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
