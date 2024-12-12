/**
 * Imports allowlist addresses from a CSV file and adds them to the mystery box allowlist database.
 * Provides option to tag the imported batch with comma-separated labels.
 *
 * Input: allowlist.csv in the scripts directory
 * Output: Addresses stored in mysteryBoxAllowlist table with optional tags
 */
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Ask for tags if required
  const tags = await new Promise<string>((resolve) => {
    rl.question(
      "Enter tags for this batch (comma-separated) or press enter to skip: ",
      resolve,
    );
  });

  const csvFilePath = path.resolve(__dirname, "allowlist.csv");
  const csv = fs.readFileSync(csvFilePath, "utf8");
  const rows = csv.split(/\r?\n/);

  await prisma.mysteryBoxAllowlist.createMany({
    data: rows.map((address: string) => ({
      address: address.trim(),
      tags,
    })),
    skipDuplicates: true,
  });

  console.log("Allowlist users added successfully!");
  rl.close();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
