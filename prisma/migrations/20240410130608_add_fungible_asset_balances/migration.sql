-- CreateEnum
CREATE TYPE "FungibleAsset" AS ENUM ('Point');

-- CreateTable
CREATE TABLE "FungibleAssetBalance" (
    "asset" "FungibleAsset" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FungibleAssetBalance_pkey" PRIMARY KEY ("asset","userId")
);

-- AddForeignKey
ALTER TABLE "FungibleAssetBalance" ADD CONSTRAINT "FungibleAssetBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
