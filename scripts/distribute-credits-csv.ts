/**
 * Distributes credits from a CSV file.
 *
 * Input: creditslist.csv in the scripts directory.
 *
 * The file should contain two columns: a wallet address and a credit count,
 * and should not have a header row.
 */
const fs = require("fs");
const path = require("path");

const {
  PrismaClient,
  FungibleAsset,
  TransactionLogType,
} = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.resolve(__dirname, "creditslist.csv");
  const csv = fs.readFileSync(csvFilePath, "utf8");
  const rows = csv.split(/\r?\n/).filter((row: string) => !!row);

  const inputRows: { address: string; credits: number }[] = rows.map(
    (row: string, index: number) => {
      const [col0, col1] = row.split(",");

      const address = col0.trim();

      if (address.length < 32 || address.length > 44) {
        throw new Error(
          `Invalid address length: ${address} @ row ${index} (must be between 32-44 characters)`,
        );
      }

      const credits = parseFloat(col1);

      if (!credits || !Number.isInteger(credits))
        throw new Error(`Invalid credits amount: ${col1} @ row ${index}`);

      return {
        address,
        credits,
      };
    },
  );

  const users = await prisma.wallet.findMany({
    select: { userId: true, address: true },
    where: {
      address: { in: inputRows.map((row) => row.address) },
    },
  });

  const addressToUser: Record<string, string> = {};

  for (let i = 0; i < users.length; i++) {
    addressToUser[users[i].address] = users[i].userId;
  }

  const validRows = inputRows.filter((row) => row.address in addressToUser);

  const records = validRows.map((row) => {
    return {
      change: row.credits,
      userId: addressToUser[row.address],
      asset: FungibleAsset.Credit,
      type: TransactionLogType.CreditByAdmin,
    };
  });

  const rv = await prisma.fungibleAssetTransactionLog.createMany({
    data: records,
    skipDuplicates: true,
  });

  console.log(`Credits distributed successfully. Created ${rv.count} rows.`);
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
