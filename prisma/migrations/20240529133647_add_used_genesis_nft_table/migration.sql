-- CreateTable
CREATE TABLE "UsedGenesisNft" (
    "nftId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedGenesisNft_nftId_key" ON "UsedGenesisNft"("nftId");

-- AddForeignKey
ALTER TABLE "UsedGenesisNft" ADD CONSTRAINT "UsedGenesisNft_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
