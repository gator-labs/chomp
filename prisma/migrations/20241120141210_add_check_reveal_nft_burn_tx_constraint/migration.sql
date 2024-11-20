ALTER TABLE "ChompResult"
ADD CONSTRAINT "check_revealNft_or_burnTx" 
CHECK (
  ("result"::text NOT IN ('Revealed', 'Claimed')) OR 
  ("revealNftId" IS NOT NULL OR "burnTransactionSignature" IS NOT NULL)
);
