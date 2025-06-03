CREATE MATERIALIZED VIEW "UserBalance" AS
SELECT
    SUM("change") AS "balance",
    "asset",
    "userId"
    FROM "FungibleAssetTransactionLog"
    GROUP BY ("userId", "asset");

CREATE INDEX "UserBalance_userId_asset" ON "UserBalance" ("userId", "asset");
