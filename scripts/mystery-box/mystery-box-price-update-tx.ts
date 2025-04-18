import {
  EChainTxStatus,
  EChainTxType,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import base58 from "bs58";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

/**
 * Update a Problematic Mystery Box Price Transactions ChainTXs
 */

const prisma = new PrismaClient();

// ❗🙈🙉 Add name of the file you want to read here
const FILE_READ_PATH =
  "results-Thu Apr 03 2025 21:09:10 GMT-0600 (Central Standard Time)-cleaned+combined+info.csv";

async function main() {
  const FILE_PATH = path.join(__dirname, FILE_READ_PATH);

  const cleanedFilePath = FILE_PATH.split(".")[0] + "+updatedTxs.csv";

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\r?\n/);

  function writeRowWithError(row: string, error: string) {
    appendFileSync(cleanedFilePath, row + `,${error},\n`);
  }

  // Process the data rows (skip the header)
  for (let i = 0; i < fileTxtRows.length; i++) {
    const row = fileTxtRows[i];
    const cols = row.split(",");

    // Header row
    if (i === 0) {
      // Write column titles
      console.log("writting headers");
      appendFileSync(cleanedFilePath, row + ",\n");
      continue;
    }

    const mbpId = cols[0];

    if (!mbpId) {
      console.log("Either finished or found a row without mbpId");
      process.exit(0);
    }

    // === Step 1 Create ChainTX

    const mbp = await prisma.mysteryBoxPrize.findUnique({
      where: { id: mbpId },
    });

    if (!mbp) {
      writeRowWithError(row, "NO_MBP");
      continue;
    }

    const oldChainTx = await prisma.chainTx.findUnique({
      where: { hash: mbp.claimHash || undefined },
    });

    if (!oldChainTx) {
      writeRowWithError(row, "NO_CHAIN_TX");
      continue;
    }

    // New Manualy Sent Transaction Hash
    const newHash = cols[7];

    // Validate that newHash is a valid Solana transaction hash
    let isValidSolanaTxHash = false;
    try {
      // Solana transaction hashes are base58-encoded strings of 32 bytes
      const decoded = base58.decode(newHash);
      isValidSolanaTxHash = decoded.length === 64;
    } catch (error) {
      isValidSolanaTxHash = false;
    }

    if (!isValidSolanaTxHash) {
      writeRowWithError(row, "INVALID_SOLANA_TX_HASH");
      continue;
    }

    await prisma.chainTx.create({
      data: {
        hash: newHash,
        wallet: oldChainTx.recipientAddress,
        type: EChainTxType.MysteryBoxClaim,
        solAmount: "0",
        tokenAmount: oldChainTx.tokenAmount,
        tokenAddress: oldChainTx.tokenAddress,
        recipientAddress: oldChainTx.recipientAddress,
        status: EChainTxStatus.Finalized,
        finalizedAt: new Date(),
      },
    });

    // === Step 2 Point MBP to new ChainTX
    let updatedMbp: Prisma.MysteryBoxPrizeGetPayload<{
      select: { claimHash: true };
    }>;

    try {
      updatedMbp = await prisma.mysteryBoxPrize.update({
        where: { id: mbpId },
        data: { claimHash: newHash },
      });
    } catch (err) {
      console.error(err);
      writeRowWithError(row, "DB_UPDATE_ERROR");
      continue;
    }

    appendFileSync(
      cleanedFilePath,
      row + `,UPDATED,${updatedMbp.claimHash},\n`,
    );
  }
}

main().then(() => console.log("Finished!"));
