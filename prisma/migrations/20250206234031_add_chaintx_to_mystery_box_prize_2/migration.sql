-- Copy over existing prize transactions
INSERT INTO "ChainTx" (
  "wallet",
  "hash",
  "tokenAmount",
  "tokenAddress",
  "finalizedAt",
  "recipientAddress",
  "solAmount",
  "type",
  "status"
) SELECT
  'CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9' AS "wallet",
  "claimHash" AS "hash",
  SUM(CAST("amount" AS NUMERIC)) AS "tokenAmount",
  "tokenAddress","claimedAt" AS "finalizedAt",
  "address" AS "recipientAddress",
  '0' AS "solAmount",
  'MysteryBoxClaim'::public."EChainTxType" AS "type",
  'Finalized'::public."EChainTxStatus" AS "status"
FROM "MysteryBoxPrize" mbp
JOIN "MysteryBox" mb ON "mbp"."mysteryBoxId" = "mb"."id"
JOIN "Wallet" w ON "w"."userId" = "mb"."userId"
WHERE "prizeType" = 'Token' and "claimHash" IS NOT NULL
GROUP BY "claimHash","tokenAddress","address","claimedAt";
