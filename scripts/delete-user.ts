import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

console.log(
  "\x1b[34m\x1b[1m --- SCRIPT FOR DELETING USER AND ASSOCIATED DATA --- \x1b[0m",
);

// Log Prisma connection URL
console.log("\nUsing Prisma URL:", process.env.DATABASE_PRISMA_URL);

async function main() {
  try {
    // 1. Ask for wallet address
    const walletAddress = await ask("Enter the wallet address to delete: ");

    // 2. Find wallet and associated user
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: { user: true },
    });

    if (!wallet?.user) {
      console.log("No user found for that wallet address.");
      process.exit(0);
    }

    const userId = wallet.user.id;

    // 3. Count entities to be deleted
    console.log("\nFound user with ID:", userId);
    console.log("\nEntities to be deleted:");

    const fatLogCount = await prisma.fungibleAssetTransactionLog.count({
      where: { userId },
    });
    console.log(`• FungibleAssetTransactionLog entries: ${fatLogCount}`);

    const userMysteryBoxes = await prisma.mysteryBox.findMany({
      where: { userId },
      select: { id: true },
    });
    const userMysteryBoxIds = userMysteryBoxes.map((box) => box.id);
    const mysteryBoxCount = userMysteryBoxes.length;
    const mysteryBoxPrizeCount = await prisma.mysteryBoxPrize.count({
      where: { mysteryBoxId: { in: userMysteryBoxIds } },
    });
    console.log(`• MysteryBox entries: ${mysteryBoxCount}`);
    console.log(`• MysteryBoxPrize entries: ${mysteryBoxPrizeCount}`);

    const chompResultCount = await prisma.chompResult.count({
      where: { userId },
    });
    console.log(`• ChompResult entries: ${chompResultCount}`);

    const questionAnswerCount = await prisma.questionAnswer.count({
      where: { userId },
    });
    console.log(`• QuestionAnswer entries: ${questionAnswerCount}`);

    const userDeckCount = await prisma.userDeck.count({
      where: { userId },
    });
    console.log(`• UserDeck entries: ${userDeckCount}`);

    const revealNftCount = await prisma.revealNft.count({
      where: { userId },
    });
    console.log(`• RevealNft entries: ${revealNftCount}`);

    const emailCount = await prisma.email.count({
      where: { userId },
    });
    console.log(`• Email entries: ${emailCount}`);

    const walletCount = await prisma.wallet.count({
      where: { userId },
    });
    console.log(`• Wallet entries: ${walletCount}`);
    console.log(`• User record: 1`);

    // 4. Ask for confirmation
    console.log("\nThis will delete ALL data associated with this user.");
    const confirm = await ask(
      "Are you sure you want to delete this user and all their data? (y/n): ",
    );

    if (confirm.toLowerCase() !== "y") {
      console.log("Operation aborted.");
      process.exit(0);
    }

    // 4. Delete user from Dynamic
    console.log("\nDeleting user from Dynamic...");
    try {
      const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;
      const dynamicEnvironmentId =
        process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

      if (!dynamicBearer || !dynamicEnvironmentId) {
        throw new Error("Missing Dynamic credentials in environment variables");
      }

      const dynamicUserId = userId; // User.id corresponds to Dynamic user ID
      const url = `https://app.dynamicauth.com/api/v0/users/${dynamicUserId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${dynamicBearer}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete user from Dynamic: ${response.statusText}`,
        );
      }

      console.log("✓ Deleted user from Dynamic");
    } catch (error: any) {
      console.error(
        "Warning: Failed to delete user from Dynamic:",
        error.message,
      );
      console.log("Continuing with local database deletion...");
    }

    // 5. Delete all associated data in correct order
    console.log("\nDeleting user data...");

    // Delete FungibleAssetTransactionLog entries
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted FungibleAssetTransactionLog entries");

    // Delete MysteryBoxPrize entries (via MysteryBox)
    const deleteMysteryBoxes = await prisma.mysteryBox.findMany({
      where: { userId },
      select: { id: true },
    });
    const deleteMysteryBoxIds = deleteMysteryBoxes.map((box) => box.id);

    await prisma.mysteryBoxPrize.deleteMany({
      where: { mysteryBoxId: { in: deleteMysteryBoxIds } },
    });
    console.log("✓ Deleted MysteryBoxPrize entries");

    // Delete MysteryBox entries
    await prisma.mysteryBox.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted MysteryBox entries");

    // Delete ChompResult entries
    await prisma.chompResult.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted ChompResult entries");

    // Delete QuestionAnswer entries
    await prisma.questionAnswer.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted QuestionAnswer entries");

    // Delete UserDeck entries
    await prisma.userDeck.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted UserDeck entries");

    // Delete RevealNft entries
    await prisma.revealNft.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted RevealNft entries");

    // Delete Email entries
    await prisma.email.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted Email entries");

    // Delete Wallet entries
    await prisma.wallet.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted Wallet entries");

    // Finally, delete the User
    await prisma.user.delete({
      where: { id: userId },
    });
    console.log("✓ Deleted User");

    console.log("\n✅ Successfully deleted user and all associated data.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
