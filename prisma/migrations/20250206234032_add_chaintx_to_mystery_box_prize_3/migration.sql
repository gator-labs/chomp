-- AddForeignKey
ALTER TABLE "MysteryBoxPrize" ADD CONSTRAINT "MysteryBoxPrize_claimHash_fkey" FOREIGN KEY ("claimHash") REFERENCES "ChainTx"("hash") ON DELETE SET NULL ON UPDATE CASCADE;
