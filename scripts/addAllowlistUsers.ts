/**
 * Imports allowlist addresses from a CSV file and adds them to the mystery box allowlist database.
 * Add the campaign and user address data in campaign mystery box allowed table
 *
 * Input: allowlist.csv in the scripts directory
 * Output: Addresses stored in mysteryBoxAllowlist table. Campaign and mysterybox relation stored in campaignMysteryBoxAllowed table
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

  const campaignBoxId = await new Promise<string>((resolve) => {
    rl.question("Enter campaign mystery box id: ", resolve);
  });

  const getCampaignMysteryBox = await prisma.campaignMysteryBox.findUnique({
    where: {
      id: campaignBoxId,
    },
  });

  if (getCampaignMysteryBox === null) {
    throw new Error(`Please provide a valid campaign id`);
  }

  const csvFilePath = path.resolve(__dirname, "allowlist.csv");
  const csv = fs.readFileSync(csvFilePath, "utf8");
  const rows = csv.split(/\r?\n/);

  // Filter out invalid addresses before adding to database
  const validRows = rows.filter((address: string) => {
    const trimmed = address.trim();
    if (trimmed.length === 0) return false;

    if (trimmed.length < 32 || trimmed.length > 44) {
      throw new Error(
        `Invalid address length: ${trimmed} (must be between 32-44 characters)`,
      );
    }
    return true;
  });

  await prisma.mysteryBoxAllowlist.createMany({
    data: validRows.map((address: string) => ({
      address: address.trim(),
    })),
    skipDuplicates: true,
  });

  await prisma.campaignMysteryBoxAllowlist.createMany({
    data: validRows.map((address: string) => ({
      address: address.trim(),
      campaignMysteryBoxId: campaignBoxId,
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
