-- CreateTable
CREATE TABLE "UsedGenisisNft" (
    "nftId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedGenisisNft_nftId_key" ON "UsedGenisisNft"("nftId");

-- AddForeignKey
ALTER TABLE "UsedGenisisNft" ADD CONSTRAINT "UsedGenisisNft_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
