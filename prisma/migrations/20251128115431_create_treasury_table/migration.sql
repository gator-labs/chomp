-- CreateTable
CREATE TABLE "BonkTreasury" (
    "id" TEXT NOT NULL,
    "balance" TEXT NOT NULL,

    CONSTRAINT "BonkTreasury_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BonkTreasury" ("id", "balance") VALUES ('treasury', '500000000');
