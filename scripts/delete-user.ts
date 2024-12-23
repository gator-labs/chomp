import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

console.log(
  "\x1b[34m\x1b[1m --- SCRIPT FOR DELETING USER AND ASSOCIATED DATA --- \x1b[0m",
);

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

    // 3. Display user info and ask for confirmation
    console.log("\nFound user with ID:", userId);
    console.log("This will delete ALL data associated with this user.");
    const confirm = await ask(
      "Are you sure you want to delete this user and all their data? (y/n): ",
    );

    if (confirm.toLowerCase() !== "y") {
      console.log("Operation aborted.");
      process.exit(0);
    }

    // 4. Delete all associated data in correct order
    console.log("\nDeleting user data...");

    // Delete FungibleAssetTransactionLog entries
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId },
    });
    console.log("✓ Deleted FungibleAssetTransactionLog entries");

    // Delete MysteryBoxPrize entries (via MysteryBox)
    const mysteryBoxes = await prisma.mysteryBox.findMany({
      where: { userId },
      select: { id: true },
    });
    const mysteryBoxIds = mysteryBoxes.map((box) => box.id);

    await prisma.mysteryBoxPrize.deleteMany({
      where: { mysteryBoxId: { in: mysteryBoxIds } },
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
