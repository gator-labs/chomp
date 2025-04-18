import { Prisma, PrismaClient } from "@prisma/client";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

/**
 * Take a CSV with Mystery Box Prices
 * and hydrate it with extra information
 */

async function main() {
  const FILE_PATH = path.join(
    __dirname,
    "results-Thu Apr 03 2025 21:09:10 GMT-0600 (Central Standard Time)-cleaned+combined.csv",
  );

  const cleanedFilePath = FILE_PATH.split(".")[0] + "+info.csv";

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\r?\n/);

  // Skip the header row
  const headerRow = fileTxtRows[0];
  // Write the header row to the output file with the additional columns
  appendFileSync(
    cleanedFilePath,
    headerRow + `,tokenAmount,recipientAddress,\n`,
  );

  // Process the data rows (skip the header)
  for (let i = 1; i <= fileTxtRows.length; i++) {
    if (i === 1) {
      continue;
    }

    const row = fileTxtRows[i];
    const cols = row.split(",");

    const mbpId = cols[0];

    if (!mbpId) {
      console.log("Either finished or found a row without mbpId");
      process.exit(0);
    }

    const chainTxRes = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT ct.*
      FROM "MysteryBoxPrize" mbp
      JOIN "ChainTx" ct ON mbp."claimHash" = ct."hash"
      WHERE mbp.id = '${mbpId}'
    `);
    const chainTx = chainTxRes[0];

    console.log(`Got ChainTX ${chainTx.hash}`);

    const userRes = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
          mb."userId"
      FROM 
          "MysteryBoxPrize" mbp
      JOIN 
          "MysteryBoxTrigger" mbt ON mbp."mysteryBoxTriggerId" = mbt."id"
      JOIN 
          "MysteryBox" mb ON mbt."mysteryBoxId" = mb."id"
      WHERE 
          mbp."id" = '${mbpId}'
    `);
    const user = userRes[0];

    const recipientAddress = chainTx.recipientAddress;
    const tokenAmount = chainTx.tokenAmount;

    const chainTxId = chainTx.hash;
    const userId = user?.userId;
    const createdAt = chainTx?.finalizedAt;

    appendFileSync(
      cleanedFilePath,
      row +
        `,${createdAt},${chainTxId},${userId},${tokenAmount},${recipientAddress},\n`,
    );
  }
}

main().then(() => console.log("Finished!"));
