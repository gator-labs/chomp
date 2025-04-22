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
 * Update a Problematic Mystery Box Prize Transactions ChainTXs
 */

const prisma = new PrismaClient();

// ❗🙈🙉 Add name of the file you want to read here
const FILE_READ_PATH =
  "results-Sun Apr 20 2025 12:25:32 GMT-0600 (Central Standard Time)-cleaned+1+1.csv";

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

  // Process the data rows
  for (let i = 0; i < fileTxtRows.length; i++) {
    const row = fileTxtRows[i];
    const cols = row.split(",");

    // Header row
    if (i === 0) {
      // Write column titles
      appendFileSync(cleanedFilePath, row + "\n");
      continue;
    }

    const mbpId = cols[0];

    if (!mbpId) {
      console.error(`Found row will num mbpId: ${row}`);
      continue;
    }

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

    try {
      // Combine both operations in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Create or update ChainTx
        const chainTx = await tx.chainTx.upsert({
          where: { hash: newHash },
          update: {}, // No updates if it exists
          create: {
            hash: newHash,
            wallet: oldChainTx.wallet,
            type: EChainTxType.MysteryBoxClaim,
            solAmount: oldChainTx.solAmount,
            tokenAmount: oldChainTx.tokenAmount,
            tokenAddress: oldChainTx.tokenAddress,
            recipientAddress: oldChainTx.recipientAddress,
            status: EChainTxStatus.Finalized,
            finalizedAt: new Date(), // update the date to now
          },
        });

        // Step 2: Update MysteryBoxPrize to point to the new ChainTx
        const updatedMbp = await tx.mysteryBoxPrize.update({
          where: { id: mbpId },
          data: { claimHash: newHash },
          select: { claimHash: true },
        });

        return { chainTx, updatedMbp };
      });

      appendFileSync(
        cleanedFilePath,
        row + `,UPDATED,${result.updatedMbp.claimHash}\n`,
      );
    } catch (err) {
      console.error(err);
      writeRowWithError(row, "DB_TRANSACTION_ERROR");
      continue;
    }
  }
}

main().then(() => console.log("Finished!"));
