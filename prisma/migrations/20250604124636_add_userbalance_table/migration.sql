-- CreateTable
CREATE TABLE "UserBalance" (
    "userId" TEXT NOT NULL,
    "asset" "FungibleAsset" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBalance_userId_asset_key" ON "UserBalance"("userId", "asset");

-- AddForeignKey
ALTER TABLE "UserBalance" ADD CONSTRAINT "UserBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
