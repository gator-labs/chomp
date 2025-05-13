import { PrismaClient } from "@prisma/client";
import { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";
import debug from "debug";
import fs from "fs";
import path from "node:path";

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_CRON_URL!);

const isMainModule = require.main === module;

// ❗🙈🙉 Add date to which start looking for problematic transactions, set as null to start from the beginning of time
// considers this takes a loooong time, if you are just testing try a few days.
let START_AT_CREATED_AT: string | null = null;

const logMain = debug("main");
const logProcess = debug("process");
const logCsv = debug("csv");
const debugProcess = debug("process:debug");

debug.enable("main");
// verbose debug
//debug.enable('process:*,csv:*,main:*');
// normal debug
debug.enable("process,csv,main");

const prisma = new PrismaClient();

type MysteryBoxPrizeWithChainTX = {
  mbpId: string;
  mbpClaimHash: string;
  ctFinalizedAt: string | null;
  mbUserId: string;
  chainTxTokenAmount: number;
  chainTxRecipientAddress: string;
};

// Output file CSV row type
type CSVRowNormalized = MysteryBoxPrizeWithChainTX & {
  error: "NOT_EXISTS" | "FAILED" | "SCRIPT_ERROR";
};

function isTransactionSuccessful(tx: ParsedTransactionWithMeta): boolean {
  // Check for transaction error (older versions)
  if (tx.meta?.err) {
    return false;
  }

  return true;
}

export function tmpDirectoryExists(): boolean {
  const tmpPath = path.join("/", "tmp");

  try {
    fs.accessSync(tmpPath, fs.constants.R_OK | fs.constants.W_OK);
    return fs.statSync(tmpPath).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * MysteryBoxPrize Token Transaction Reconciliation System
 *
 * Purpose:
 * Detects and handles cases where MysteryBoxPrizes are marked as Claimed in our db
 * but have either:
 *  - No corresponding Solana transaction
 *  - Failed Solana transaction
 *
 * Architecture:
 * 1. Get MysteryBoxPrizes in batches
 * 2. For each prize, check if the transaction exists and is successful
 * 3. If there's an issue, write it to the CSV file
 **/

logMain("Finding users with Mystery Box Prizes not on chain");

// NOTICE: leaving the index creating for cases when you want to run the script
// manually using replica, in prod they should already exist so this do nothing
async function ensureIndexesExist() {
  await prisma.$transaction([
    prisma.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'MysteryBoxPrize' 
            AND indexname = 'idx_mysteryboxprize_claimhash'
          ) THEN
            CREATE INDEX idx_mysteryboxprize_claimhash ON "MysteryBoxPrize" ("claimHash");
          END IF;
        END $$;
      `,
    prisma.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'MysteryBoxPrize' 
            AND indexname = 'idx_mysteryboxprize_createdat'
          ) THEN
            CREATE INDEX idx_mysteryboxprize_createdat ON "MysteryBoxPrize" ("createdAt");
          END IF;
        END $$;
      `,
    prisma.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'MysteryBoxPrize' 
            AND indexname = 'idx_mysteryboxprize_filter'
          ) THEN
            CREATE INDEX idx_mysteryboxprize_filter ON "MysteryBoxPrize" ("prizeType", "status") 
            WHERE "claimHash" IS NOT NULL;
          END IF;
        END $$;
      `,
  ]);

  logMain("Index verification/creation completed");
}

// Function to check a single transaction
async function checkSolTransaction(
  mbp: MysteryBoxPrizeWithChainTX,
  csvWriter: (row: CSVRowNormalized) => void,
): Promise<void> {
  logProcess(`Processing: ${mbp.mbpClaimHash}`);

  // Keeping ts happy
  // This should not happen we only query records with claimHash
  if (mbp.mbpClaimHash == null) {
    logProcess(`[ERROR] Found MBP with null claimHash: ${mbp.mbpId}`);
    return;
  }

  try {
    debugProcess(`Getting TX: ${mbp.mbpClaimHash}`);

    const tx = await CONNECTION.getParsedTransaction(mbp.mbpClaimHash, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    // Transaction does not exist at all on Blockchain (problematic!)
    if (tx === null) {
      logProcess(
        `Found a TX that does not exist on Blockchain: ${mbp.mbpClaimHash}`,
      );

      csvWriter({
        ...mbp,
        error: "NOT_EXISTS",
      });

      return;
    }

    // Transaction has error (problematic!)
    if (!isTransactionSuccessful(tx)) {
      logProcess(`Found TX not successful: ${mbp.mbpClaimHash}`);
      debugProcess(tx.meta);

      csvWriter({
        ...mbp,
        error: "FAILED",
      });

      return;
    }

    // TX is fine
    logProcess(`TX is fine: ${mbp.mbpClaimHash}`);
  } catch (err) {
    // Error getting transaction
    logProcess(`Error getting TX ${mbp.mbpClaimHash}: ${err}`);

    // Record this mbp as error: "SCRIPT_ERROR" in the csv
    // it will be retried again in the next script
    csvWriter({
      ...mbp,
      error: "SCRIPT_ERROR" as any, // Type assertion to handle the new error type
    });
  }
}

// Process mystery box prizes in batches, but handle each one sequentially
async function processMysteryBoxPrizes(
  batchSize: number,
  csvPath: string,
): Promise<void> {
  logMain("Starting sequential processing of Mystery Box Prizes");

  // Initialize counters
  let processedCount = 0;
  let errorCount = 0;
  let notExistsCount = 0;
  let failedCount = 0;
  let scriptErrorCount = 0;

  // Create or truncate the output file
  fs.writeFileSync(csvPath, "");

  // Create CSV file headers
  const headers =
    [
      "mbpId",
      "mbpClaimHash", // TxId
      "error",
      "ctFinalizedAt",
      "mbUserId",
      "chainTxTokenAmount",
      "chainTxRecipientAddress",
    ].join(",") + "\n";

  // Write headers to the CSV file
  fs.appendFileSync(csvPath, headers);

  // CSV writer function
  const writeToCsv = (row: CSVRowNormalized) => {
    const csvLine =
      [
        row.mbpId,
        row.mbpClaimHash,
        row.error,
        row.ctFinalizedAt,
        row.mbUserId,
        row.chainTxTokenAmount.toString(),
        row.chainTxRecipientAddress,
      ].join(",") + "\n";

    fs.appendFileSync(csvPath, csvLine);

    if (row.error === "NOT_EXISTS") {
      notExistsCount++;
    } else if (row.error === "FAILED") {
      failedCount++;
    } else if (row.error === "SCRIPT_ERROR") {
      scriptErrorCount++;
    }

    errorCount++;
    logCsv(`Found problematic MBP ${row.mbpId} (${row.error})`);
  };

  let offset = 0;
  let hasMoreRecords = true;

  while (hasMoreRecords) {
    try {
      // Fetch a batch of records
      const prizes = await prisma.$queryRawUnsafe<
        Array<MysteryBoxPrizeWithChainTX>
      >(`
        SELECT 
          mbp."id" as "mbpId",
          mbp."claimHash" as "mbpClaimHash",
          ct."finalizedAt" as "ctFinalizedAt",
          mb."userId" as "mbUserId",
          ct."tokenAmount" as "chainTxTokenAmount",
          ct."recipientAddress" as "chainTxRecipientAddress"
        FROM 
          "MysteryBoxPrize" mbp
        JOIN 
          "MysteryBoxTrigger" mbt ON mbp."mysteryBoxTriggerId" = mbt."id"
        JOIN 
          "MysteryBox" mb ON mbt."mysteryBoxId" = mb."id"
        LEFT JOIN 
          "ChainTx" ct ON mbp."claimHash" = ct."hash"
        WHERE 
          mbp."prizeType" = 'Token' AND 
          mbp."status" = 'Claimed' AND 
          mbp."claimHash" IS NOT NULL AND
          mbp."createdAt" >= ${START_AT_CREATED_AT ? `'${new Date(START_AT_CREATED_AT).toISOString()}'` : "'1970-01-01'"}
        ORDER BY 
          mbp."claimHash" ASC, 
          mbp."createdAt" DESC
        LIMIT ${batchSize} OFFSET ${offset};
      `);

      if (prizes.length === 0) {
        hasMoreRecords = false;
        continue;
      }

      logMain(
        `Processing batch of ${prizes.length} records (offset: ${offset})`,
      );

      // Process each record sequentially
      for (const prize of prizes) {
        await checkSolTransaction(prize, writeToCsv);
        processedCount++;

        if (processedCount % 10 === 0) {
          logMain(
            `Processed ${processedCount} records, found ${errorCount} errors (${notExistsCount} not exist, ${failedCount} failed, ${scriptErrorCount} script errors)`,
          );
        }
      }

      offset += prizes.length;
    } catch (err) {
      logMain(`Database error: ${err}`);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  logMain(
    `Processing complete. Total processed: ${processedCount}, errors: ${errorCount} (${notExistsCount} not exist, ${failedCount} failed, ${scriptErrorCount} script errors)`,
  );
}

export async function main(startAtCreatedAt?: string) {
  if (startAtCreatedAt) {
    START_AT_CREATED_AT = startAtCreatedAt;
  }
  const BATCH_SIZE = 20;
  const CSV_PATH = path.join(
    tmpDirectoryExists() ? "/tmp" : __dirname,
    `results-${new Date().toISOString().split("T")[0]}.csv`,
  );

  await ensureIndexesExist();

  await processMysteryBoxPrizes(BATCH_SIZE, CSV_PATH);

  logMain(`Results written to ${CSV_PATH}`);

  return CSV_PATH;
}

if (isMainModule) {
  main()
    .catch((err) => console.error(err))
    .finally(async () => {
      await prisma.$disconnect();
    });
}
