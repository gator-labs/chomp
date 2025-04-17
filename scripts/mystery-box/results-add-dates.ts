import { PrismaClient } from "@prisma/client";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

/**
 * Take a CSV with Mystery Box Prices
 * and hydrate it with extra information
 */

async function main() {
  const FILE_PATH = path.join(__dirname, "not-existing-fix.csv");

  const cleanedFilePath = FILE_PATH.split(".")[0] + "+info.csv";

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\r?\n/);

  for (let row of fileTxtRows) {
    const cols = row.split(",");

    const mbpId = cols[0];

    if (mbpId == null) {
      throw new Error("Either finished or found a row without mbpId");
    }

    //const mbp = await prisma.mysteryBoxPrize.findUnique({
    //  where: {
    //    id: mbpId,
    //  },
    //});

    const chainTx = await prisma.$queryRaw<Array<any>>`
      SELECT ct.*
      FROM "MysteryBoxPrize" mbp
      JOIN "ChainTx" ct ON mbp."claimHash" = ct."hash"
      WHERE mbp.id = ${mbpId}
    `;

    const recipientAddress = chainTx[0]?.recipientAddress;
    const tokenAmount = chainTx[0]?.tokenAmount;

    appendFileSync(
      cleanedFilePath,
      row + `,${tokenAmount},${recipientAddress},\n`,
    );
  }
}

main().then(() => console.log("Finished!"));
