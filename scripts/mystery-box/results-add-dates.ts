import { PrismaClient } from "@prisma/client";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const FILE_PATH = path.join(
    __dirname,
    "results-Thu Apr 03 2025 21:09:10 GMT-0600 (Central Standard Time)-cleaned+1+1.csv",
  );

  const cleanedFilePath = FILE_PATH.split(".")[0] + "+dates.csv";

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

    const mbp = await prisma.mysteryBoxPrize.findUnique({
      where: {
        id: mbpId,
      },
    });

    appendFileSync(
      cleanedFilePath,
      row + `,${mbp?.createdAt},${mbp?.claimedAt},\n`,
    );
  }
}

main().then(() => console.log("Finished!"));
