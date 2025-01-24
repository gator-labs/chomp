// Run this script using: yarn dev:distribute-credit
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import * as readline from "readline";

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function distributeCredits(totalPoints: number) {
  const transactions = await prisma.fungibleAssetTransactionLog.groupBy({
    by: ["userId"],
    _sum: {
      change: true,
    },
    where: {
      asset: FungibleAsset.Point,
    },
    having: {
      change: {
        _sum: {
          gt: totalPoints,
        },
      },
    },
  });
  return transactions;
}

rl.question(
  "Enter the minimum number of points a user must have to receive credits: ",
  async (pointsInput) => {
    rl.question(
      "Enter the amount of credits to distribute to each user: ",
      async (creditInput) => {
        const totalPoints = parseFloat(pointsInput);
        const creditAmount = parseFloat(creditInput);

        const tx = await distributeCredits(totalPoints);
        rl.question(
          `Total number of users eligible: ${tx.length}. Each user will receive ${creditAmount} credits. Do you wish to proceed (y/n)? `,
          async (answer) => {
            if (answer.toLowerCase() === "y") {
              console.log("Proceeding with distribution...");
              await prisma.fungibleAssetTransactionLog.createMany({
                data: tx.map((t: { userId: string }) => ({
                  userId: t.userId,
                  asset: FungibleAsset.Credit,
                  change: creditAmount,
                  type: TransactionLogType.CreditByAdmin,
                })),
              });
            } else {
              console.log("Distribution cancelled.");
            }
            rl.close();
          },
        );
      },
    );
  },
);
