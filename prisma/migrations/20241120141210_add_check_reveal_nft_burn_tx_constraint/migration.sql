WITH SelectedResults AS (
  SELECT 
    ROW_NUMBER() OVER () - 1 AS row_num, 
    "userId", 
    "createdAt", 
    "updatedAt"
  FROM public."ChompResult"
  WHERE 
    "burnTransactionSignature" IS NULL 
    AND "revealNftId" IS NULL 
    AND "result" != 'Dismissed'::public."ResultType"
)
INSERT INTO public."RevealNft" ("nftId", "userId", "createdAt", "updatedAt", "nftType")
SELECT 
  CONCAT('dummy-nft-', row_num) AS "nftId",
  "userId",
  "createdAt",
  "updatedAt",
  'Genesis' AS "nftType" 
FROM SelectedResults;

WITH InsertedNFTs AS (
  SELECT 
    rn."nftId", 
    sr.chomp_id
  FROM public."RevealNft" rn
  JOIN (
    SELECT 
      ROW_NUMBER() OVER () - 1 AS row_num, 
      id AS chomp_id
    FROM public."ChompResult"
    WHERE 
      "burnTransactionSignature" IS NULL 
      AND "revealNftId" IS NULL 
      AND "result" != 'Dismissed'::public."ResultType"
  ) sr
  ON rn."nftId" = CONCAT('dummy-nft-', sr.row_num)
)
UPDATE public."ChompResult" cr
SET "revealNftId" = i."nftId"
FROM InsertedNFTs i
WHERE cr.id = i.chomp_id;

ALTER TABLE "ChompResult"
ADD CONSTRAINT "check_revealNft_or_burnTx" 
CHECK (
  ("result"::text NOT IN ('Revealed', 'Claimed')) OR 
  ("revealNftId" IS NOT NULL OR "burnTransactionSignature" IS NOT NULL)
);
