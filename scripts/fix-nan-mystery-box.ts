import { PrismaClient } from "@prisma/client";
import Decimal from "decimal.js";

import { calculateMysteryBoxHubReward } from "../app/utils/algo";

const prisma = new PrismaClient();

async function updateMysteryBoxPrizes() {
  // Step 1: Query for all MysteryBoxPrizes where amount = NaN
  const mysteryBoxPrizes = await prisma.mysteryBoxPrize.findMany({
    where: {
      amount: "NaN", // We're looking for "NaN" stored as a string
    },
    include: {
      mysteryBoxTrigger: {
        include: {
          MysteryBox: {
            include: {
              user: true, // Get the user details to fetch userId
            },
          },
        },
      },
    },
  });

  console.log(
    `Found ${mysteryBoxPrizes.length} MysteryBoxPrizes with NaN amount.`,
  );

  // Step 2: Loop through the results and invoke `calculateMysteryBoxHubReward` for each (userId, questionId)
  for (const prize of mysteryBoxPrizes) {
    const userId = prize.mysteryBoxTrigger?.MysteryBox?.user.id;
    const questionId = prize.mysteryBoxTrigger?.questionId;

    if (!userId || !questionId) {
      console.warn(
        `Skipping MysteryBoxPrize for user: ${userId}, question: ${questionId} because one of the values is missing.`,
      );
      continue;
    }

    console.log(
      `Processing MysteryBoxPrize for user: ${userId}, question: ${questionId}`,
    );

    // Invoke calculateMysteryBoxHubReward
    const rewardData = await calculateMysteryBoxHubReward(userId, [questionId]);
    console.log("rewardData", rewardData);

    // Step 3: Update the MysteryBoxPrize amount with the new value (if it's found)
    if (rewardData && rewardData.length > 0) {
      const newAmount = rewardData[0].bonkRewardAmount;

      console.log(
        `Updating MysteryBoxPrize for user: ${userId}, question: ${questionId} with amount: ${newAmount}`,
      );

      try {
        // Convert the amount to a Decimal object to ensure it is a valid number
        const newAmountChecked = new Decimal(newAmount).toString();

        await prisma.mysteryBoxPrize.update({
          where: {
            id: prize.id,
          },
          data: {
            amount: newAmountChecked, // Ensure the amount is updated as a string
          },
        });

        console.log(
          `MysteryBoxPrize for user: ${userId} updated successfully to ${newAmountChecked}`,
        );
      } catch (e) {
        console.error("Error updating MysteryBoxPrize:", e);
      }
    } else {
      console.log(
        `No reward data found for user: ${userId}, question: ${questionId}. Skipping update.`,
      );
    }
  }
}

async function main() {
  try {
    await updateMysteryBoxPrizes();
    console.log("MysteryBoxPrizes update complete.");
  } catch (error) {
    console.error("Error updating MysteryBoxPrizes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
