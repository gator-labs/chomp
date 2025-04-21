import { PrismaClient } from "@prisma/client";
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import debug from "debug";
import fs from "fs";
//import logUpdate from "log-update";
import path from "node:path";
import util from "node:util";

import { CONNECTION } from "../../app/utils/solana";

// ❗🙈🙉 Add date to which start looking for problematic transactions, set as null to start from the beginning of time
// considers this takes a loooong time, if you are just testing try a few days.
const START_AT_CREATED_AT: string | null = "2025-03-01";

const logMain = debug("main");

const logProd = debug("prod");
const logFilter = debug("filter");
const logCsv = debug("csv");

const debugProd = debug("prod:debug");
const debugFilter = debug("filter:debug");
//const debugCsv = debug('csv:debug');

debug.enable("main");
// verbose debug
//debug.enable('prod:*,filter:*,csv:*,main:*');
// normal debug
debug.enable("prod,filter,csv,main");

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
  error: "NOT_EXISTS" | "FAILED";
};

type MysteryBoxPrizeWithChainTXWithSolTxErrored = {
  mbp: MysteryBoxPrizeWithChainTX;
  tx: ParsedTransactionWithMeta | null;
  error: "NOT_EXISTS" | "FAILED";
};

function isTransactionSuccessful(tx: ParsedTransactionWithMeta): boolean {
  // Check for transaction error (older versions)
  if (tx.meta?.err) {
    return false;
  }

  return true;
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
 * [Stage 1]
 * Producer: Gets MysteryBoxPrizes
 *           → Queue<Array> 1
 *
 * [Stage 2]
 * Consumer/Producer: Filter MysteryBoxPrizes where TXs does not exists or is unsuccessful
 *           → Queue 2<Array>
 *
 * [Stage 3]
 * Consumer: Save problematic MysteryBoxPrizes in CSV file
 *           → CSV file
 **/

logMain("Finding users with Mistery Box Prices not on chain");

// Create needed indexes: NOTICE: this script is only intented to run on replica
// if you want to run this script on real prod consider that the indexes are permanent
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

let mysteryBoxPricesProducerFinshed = false;
let mbpProdCount = 0;
async function produceMysteryBoxPrices(
  queue: Array<MysteryBoxPrizeWithChainTX>,
  maxQueued: number,
  batchSize: number,
  pull_time: number,
): Promise<void> {
  logProd("[MBP Prod] Started!");

  let theresMorePricesInDb = true;
  let offset = 0;

  do {
    // if queue is full we wait PULL_TIME and try again
    if (queue.length >= maxQueued) {
      await new Promise((resolve) => setTimeout(resolve, pull_time));
      debugProd("[MBP Prod]: queue 1 full, waiting ");
      continue;
    }

    let newPrizes: Array<MysteryBoxPrizeWithChainTX>;
    try {
      newPrizes = await prisma.$queryRawUnsafe<
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
    } catch (err) {
      logProd("[MBP Prod]: db error, waiting a bit & trying again...");
      logProd(err);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    if (!newPrizes.length) {
      logProd("[MBP Prod]: theres no more prices on db");
      theresMorePricesInDb = false;
      continue;
    }
    logProd(`[MBP Prod] got ${newPrizes.length} MBP`);

    mbpProdCount += newPrizes.length;
    offset += newPrizes.length;

    queue.unshift(...newPrizes);
  } while (theresMorePricesInDb);

  mysteryBoxPricesProducerFinshed = true;
  logProd(`[MBP Prod] Finished! Produced: ${mbpProdCount}`);
}

let filteredCount = 0;
let mbpWTxNotExistErrorCount = 0;
let mbpWTxFailErrorCount = 0;
let mysteryBoxFilterFinished = false;
let checkTxErrorCount = 0;
async function consumeMysteryBoxPricesCheckTXsAndFilter(
  queueMBPs: Array<MysteryBoxPrizeWithChainTX>,
  queueMBPWErrors: Array<MysteryBoxPrizeWithChainTXWithSolTxErrored>,
  maxWorkers: number,
  queuePullTime: number,
  workerPullTime: number,
): Promise<void> {
  logFilter("[Filter] Started!");

  const workers: Array<Function | null> = new Array(maxWorkers).fill(null);

  function findAvailableWorker(): number | null {
    for (let i = 0; i < maxWorkers; i++) {
      if (!workers[i]) {
        return i;
      }
    }
    return null;
  }

  async function checkSolTXWorker(
    index: number,
    mbp: MysteryBoxPrizeWithChainTX,
  ) {
    debugFilter(`[Filter W${index}] TXCheck: `, mbp.mbpClaimHash);

    // this should not happen, keeping ts happy
    if (mbp.mbpClaimHash == null) {
      logFilter(
        `[Filter W${index}] Found MBP with null claimHash: `,
        mbp.mbpId,
      );
      return null;
    }

    let tx: ParsedTransactionWithMeta | null = null;
    try {
      debugFilter(`[Filter W${index}] getting TX`);

      tx = await CONNECTION.getParsedTransaction(mbp.mbpClaimHash, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      // Transaction does not exists at all on Blockchain (problematic!)
      if (tx === null) {
        debugFilter(
          `[Filter W${index}] found a TX that does not exists on Blockchain ${mbp.mbpClaimHash}`,
        );

        queueMBPWErrors.push({ mbp, tx, error: "NOT_EXISTS" });
        mbpWTxNotExistErrorCount++;

        return;
      }

      // Transaction has error (problematic!)
      if (!isTransactionSuccessful(tx)) {
        debugFilter(`[Filter W${index}] found tx not successful`);
        debugFilter(`[Filter W${index}]`, tx.meta);
        debugFilter(tx);

        queueMBPWErrors.push({ mbp, tx, error: "FAILED" });
        mbpWTxFailErrorCount++;

        return;
      }

      // tx is fine
      logFilter(`[filter W${index}] tx is fine ${mbp.mbpClaimHash}`);
      return null;
    } catch (err) {
      // Error getting transaction, Ignoring it for the moment
      checkTxErrorCount++;
      logFilter("[Filter W${index}] error getting TX adding it back to queue");
      queueMBPs.push(mbp);

      // Ignore ERROR
      return;
    } finally {
      filteredCount++;
    }
  }

  while (!mysteryBoxPricesProducerFinshed || queueMBPs.length) {
    // if there are no queue elements wait for a bit
    if (!queueMBPs.length) {
      debugFilter("[Filter] queue empty waiting");
      await new Promise((resolve) => setTimeout(resolve, queuePullTime));
      continue;
    }

    let availableWorkerIndex = findAvailableWorker();
    if (availableWorkerIndex === null) {
      debugFilter("[Filter] no available workers, waiting");
      await new Promise((resolve) => setTimeout(resolve, workerPullTime));
      continue;
    }

    debugFilter("[Filter] available worker: ", availableWorkerIndex);

    const mysteryPriceBox = queueMBPs.pop();

    if (!mysteryPriceBox) {
      throw new Error("[Filter] ERROR pop empty queueMBPs");
    }

    // set the worker slot as "busy"
    workers[availableWorkerIndex] = () => {}; // TODO: use a boolean instead
    // run the worker and clear worker slot when it finishes
    checkSolTXWorker(availableWorkerIndex, mysteryPriceBox).finally(
      () => (workers[availableWorkerIndex] = null),
    );
  }

  mysteryBoxFilterFinished = true;
  logFilter(`[MBP Filter] Finished! Filtered: ${filteredCount}`);
}

let csvProdFinished = false;
async function consumeMysteryBoxPrizesWTxToCsv(
  queueMbpWTx: Array<MysteryBoxPrizeWithChainTXWithSolTxErrored>,
  pull_time: number,
  outputFilePath: string,
) {
  logCsv("CSV writter started");

  // Create or truncate the output file
  fs.writeFileSync(outputFilePath, "");

  // Create CSV file headers
  const csvLine =
    [
      "mbpId",
      "mbpClaimHash", // TxId
      "error",
      "ctFinalizedAt",
      "mbUserId",
      "chainTxTokenAmount",
      "chainTxRecipientAddress",
    ].join(",") + "\n";

  // Append file headers to the CSV file
  fs.appendFileSync(outputFilePath, csvLine);

  do {
    // if there's nothing on the queue wait a bit
    if (!queueMbpWTx.length) {
      await new Promise((resolve) => setTimeout(resolve, pull_time));
      continue;
    }

    const mbpWTx = queueMbpWTx.pop();

    if (mbpWTx == null) {
      console.error("Should not happen keep ts happy");
      continue;
    }

    const csvRow: CSVRowNormalized = {
      mbpId: mbpWTx.mbp.mbpId,
      mbpClaimHash: mbpWTx.mbp.mbpClaimHash,
      error: mbpWTx.error,
      ctFinalizedAt: mbpWTx.mbp.ctFinalizedAt,
      mbUserId: mbpWTx.mbp.mbUserId,
      chainTxTokenAmount: mbpWTx.mbp.chainTxTokenAmount,
      chainTxRecipientAddress: mbpWTx.mbp.chainTxRecipientAddress,
    };

    // Create CSV line
    const csvLine =
      [
        csvRow.mbpId,
        csvRow.mbpClaimHash, // TxId
        csvRow.error,
        csvRow.ctFinalizedAt,
        csvRow.mbUserId,
        csvRow.chainTxTokenAmount.toString(),
        csvRow.chainTxRecipientAddress,
      ].join(",") + "\n";

    // Append to the CSV file
    fs.appendFileSync(outputFilePath, csvLine);

    logCsv(`Found problematic MBP ${mbpWTx.mbp.mbpId}`);
    logCsv(util.inspect(mbpWTx, { depth: null }));
  } while (
    !mysteryBoxPricesProducerFinshed ||
    !mysteryBoxFilterFinished ||
    queueMbpWTx.length
  );

  csvProdFinished = true;
  logCsv("[CSV] Finished!");
}

async function main() {
  // MBP Producer settings
  const MBP_PRODUCER_MAX_QUEUED = 100;
  const MBP_PRODUCER_BATCH = 20;
  const PULL_TIME = 200;

  // Filter consumer/producer settings
  const MAX_WORKERS = 1; // More than 2 gives "Too Many Requests" errors some times, use 1 to be safe
  const QUEUE_PULL_TIME = 10;
  const WORKER_PULL_TIME = 10;

  // CSV Consumer settings
  const CSV_PULL_TIME = 50;
  const CSV_PATH = path.join(__dirname, `results-${new Date()}.csv`);

  await ensureIndexesExist();

  const prizeCount = await prisma.$queryRawUnsafe(`
    SELECT COUNT(DISTINCT "claimHash") as count
    FROM "MysteryBoxPrize"
    WHERE "prizeType" = 'Token'
    AND "status" = 'Claimed'
    AND "claimHash" IS NOT NULL
  `);

  logMain(`There are ${util.inspect(prizeCount, { depth: null })} MBPs in DB`);

  // Queue for all MBPs found in DB
  const queueMBPs = new Array<MysteryBoxPrizeWithChainTX>();
  produceMysteryBoxPrices(
    queueMBPs,
    MBP_PRODUCER_MAX_QUEUED,
    MBP_PRODUCER_BATCH,
    PULL_TIME,
  );

  // Queue for MBPs where TX is failed
  const queueMBPWErrors =
    new Array<MysteryBoxPrizeWithChainTXWithSolTxErrored>();
  consumeMysteryBoxPricesCheckTXsAndFilter(
    queueMBPs,
    queueMBPWErrors,
    MAX_WORKERS,
    QUEUE_PULL_TIME,
    WORKER_PULL_TIME,
  );

  consumeMysteryBoxPrizesWTxToCsv(queueMBPWErrors, CSV_PULL_TIME, CSV_PATH);

  //const intId = setInterval(function() {
  //  logUpdate(
  //    `
  //    \n\n\n\n\n\n\n\n\n
  //    mysteryBoxPricesProducerFinshed: ${mysteryBoxPricesProducerFinshed}
  //    queueMBPs: ${queueMBPs.length}
  //    mbpProdCount: ${mbpProdCount}
  //
  //    filteredCount: ${filteredCount}
  //    mbpWTxNotExistErrorCount: ${mbpWTxNotExistErrorCount}
  //    mbpWTxFailErrorCount: ${mbpWTxFailErrorCount}
  //    mysteryBoxFilterFinished ${mysteryBoxFilterFinished}
  //    checkTxErrorCount: ${checkTxErrorCount}
  //    `,
  //  );
  //  if (
  //    mysteryBoxPricesProducerFinshed &&
  //    mysteryBoxFilterFinished &&
  //    csvProdFinished
  //  ) {
  //    clearInterval(intId);
  //  }
  //}, 50);
}

main().catch((err) => console.error(err));
