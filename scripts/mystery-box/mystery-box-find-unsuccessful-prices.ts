import fs from 'fs';
import { PrismaClient, MysteryBoxPrize } from "@prisma/client";
import logUpdate from 'log-update';
//import { printTable } from 'console-table-printer';
import { CONNECTION } from '../../app/utils/solana';
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import ora from 'ora';
import util from 'node:util';
import path from 'node:path';
import debug from 'debug';

const logMain = debug('main');

const logProd = debug('prod');
const logFilter = debug('filter');
const logCsv = debug('csv');

const debugProd = debug('prod:debug');
const debugFilter = debug('filter:debug');
//const debugCsv = debug('csv:debug');

debug.enable('main');
// verbose debug
// debug.enable('prod:*,filter:*,csv:*,main:*');
// normal debug
// debug.enable('prod,filter,csv,main');


const prisma = new PrismaClient();

type MysteryBoxPrizesWTx = {
  mbp: MysteryBoxPrize,
  tx: ParsedTransactionWithMeta | null,
  error: 'NOT_EXISTS' | 'FAILED'
}

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

logMain('Finding users with Mistery Box Prices not on chain');

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
      `
  ]);

  logMain('Index verification/creation completed');
}


let mysteryBoxPricesProducerFinshed = false;
let mbpProdCount = 0;
async function produceMysteryBoxPrices(queue: Array<MysteryBoxPrize>, maxQueued: number, batchSize: number, pull_time: number): Promise<void> {

  logProd('[MBP Prod] Started!');

  let theresMorePricesInDb = true
  let offset = 0;

  do {
    // if queue is full we wait PULL_TIME and try again
    if (queue.length >= maxQueued) {
      await new Promise((resolve) => setTimeout(resolve, pull_time));
      debugProd('[MBP Prod]: queue 1 full, waiting ');
      continue;
    }

    let newPrices: MysteryBoxPrize[];

    try {
      newPrices = await prisma.$queryRawUnsafe<MysteryBoxPrize[]>(`
      SELECT DISTINCT ON ("claimHash") *
      FROM "MysteryBoxPrize"
      WHERE 
        "prizeType" = 'Token' AND 
        "status" = 'Claimed' AND 
        "claimHash" IS NOT NULL
        -- Add createdAt condition if lastCreatedAt is provided
      ORDER BY 
        "claimHash" ASC, 
        "createdAt" DESC
      LIMIT ${batchSize} OFFSET ${offset};
    `);
    } catch (err) {
      logProd('[MBP Prod]: db error, waiting a bit & trying again...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    if (!newPrices.length) {
      logProd('[MBP Prod]: theres no more prices on db');
      theresMorePricesInDb = false;
      continue;
    }
    logProd(`[MBP Prod] got ${newPrices.length} MBP`);

    mbpProdCount += newPrices.length;
    offset += newPrices.length;

    queue.unshift(...newPrices);
  } while (theresMorePricesInDb);

  mysteryBoxPricesProducerFinshed = true;
  logProd(`[MBP Prod] Finished! Produced: ${mbpProdCount}`);
}

let filteredCount = 0;
let mbpWTxNotExistErrorCount = 0;
let mbpWTxFailErrorCount = 0;
let mysteryBoxFilterFinished = false;
let checkTxErrorCount = 0;
async function consumeMysteryBoxPricesCheckTXsAndFilter(queueMBPs: Array<MysteryBoxPrize>, queueMbpWTx: Array<MysteryBoxPrizesWTx>, maxWorkers: number, queuePullTime: number, workerPullTime: number): Promise<void> {
  logFilter('[Filter] Started!');

  const workers: Array<Function | null> = new Array(maxWorkers).fill(null);

  function findAvailableWorker(): number | null {
    for (let i = 0; i < maxWorkers; i++) {
      if (!workers[i]) {
        return i;
      }
    }
    return null;
  }

  async function checkSolTXWorker(index: number, mbp: MysteryBoxPrize) {
    debugFilter(`[Filter W${index}] TXCheck: `, mbp.claimHash);

    // this should not happen, keeping ts happy
    if (mbp.claimHash == null) {
      logFilter(`[Filter W${index}] Found MBP with null claimHash: `, mbp.id);
      return null;
    }

    let tx: ParsedTransactionWithMeta | null = null;
    try {
      debugFilter(`[Filter W${index}] getting TX`);

      tx = await CONNECTION.getParsedTransaction(mbp.claimHash, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      // Transaction does not exists at all on Blockchain (problematic!)
      if (tx === null) {
        debugFilter(`[Filter W${index}] found a TX that does not exists on Blockchain ${mbp.claimHash}`);

        queueMbpWTx.push({ mbp, tx, error: 'NOT_EXISTS' });
        mbpWTxNotExistErrorCount++;

        return;
      }

      // Transaction has error (problematic!)
      if (!isTransactionSuccessful(tx)) {
        debugFilter(`[Filter W${index}] found tx not successful`);
        debugFilter(`[Filter W${index}]`, tx.meta);
        debugFilter(tx);

        queueMbpWTx.push({ mbp, tx, error: 'FAILED' });
        mbpWTxFailErrorCount++;

        return
      }

      // tx is fine
      logFilter(`[filter W${index}] tx is fine ${mbp.claimHash}`);
      return null;
    } catch (err) {
      // Error getting transaction, Ignoring it for the moment
      checkTxErrorCount++;
      logFilter('[Filter W${index}] error getting TX adding it back to queue');
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
      debugFilter('[Filter] queue empty waiting');
      await new Promise((resolve) => setTimeout(resolve, queuePullTime));
      continue;
    }

    let availableWorkerIndex = findAvailableWorker();
    if (availableWorkerIndex === null) {
      debugFilter('[Filter] no available workers, waiting');
      await new Promise((resolve) => setTimeout(resolve, workerPullTime));
      continue;
    }

    debugFilter('[Filter] available worker: ', availableWorkerIndex);

    const mysteryPriceBox = queueMBPs.pop();

    if (!mysteryPriceBox) {
      throw new Error('[Filter] ERROR pop empty queueMBPs');
    }

    // set the worker slot as "busy"
    workers[availableWorkerIndex] = () => { }; // TODO: use a boolean instead
    // run the worker and clear worker slot when it finishes
    checkSolTXWorker(availableWorkerIndex, mysteryPriceBox)
      .finally(() => workers[availableWorkerIndex] = null);
  }

  mysteryBoxFilterFinished = true;
  logFilter(`[MBP Filter] Finished! Filtered: ${filteredCount}`);
}

let csvProdFinished = false;
async function consumeMysteryBoxPrizesWTxToCsv(queueMbpWTx: Array<MysteryBoxPrizesWTx>, pull_time: number, outputFilePath: string) {
  logCsv('CSV writter started');

  // Create or truncate the output file
  fs.writeFileSync(outputFilePath, '');

  do {
    // if there's nothing on the queue wait a bit
    if (!queueMbpWTx.length) {
      await new Promise((resolve) => setTimeout(resolve, pull_time));
      continue;
    }

    const mbpWTx = queueMbpWTx.pop();

    // Extract the required fields
    const mbpId = mbpWTx?.mbp.id || '';
    const claimHash = mbpWTx?.mbp.claimHash || '';
    const txId = mbpWTx?.tx?.transaction.signatures.toString() || '';
    const error = mbpWTx?.error;

    // Create CSV line
    const csvLine = `${mbpId},${claimHash},${txId},${error}\n`;

    // Append to the CSV file
    fs.appendFileSync(outputFilePath, csvLine);

    logCsv(`Found problematic MBP ${mbpWTx?.mbp.id}`);
    logCsv(util.inspect(mbpWTx, { depth: null }));

  } while (!mysteryBoxPricesProducerFinshed || !mysteryBoxFilterFinished || queueMbpWTx.length);

  csvProdFinished = true;
  logCsv('[CSV] Finished!');
}




async function main() {
  // MBP Producer settings
  const MBP_PRODUCER_MAX_QUEUED = 100;
  const MBP_PRODUCER_BATCH = 20;
  const PULL_TIME = 200;

  // Filter consumer/producer settings
  const MAX_WORKERS = 1; // More than 2 gives "Too Many Requests" error for me
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
  const queueMBPs = new Array<MysteryBoxPrize>;
  produceMysteryBoxPrices(queueMBPs, MBP_PRODUCER_MAX_QUEUED, MBP_PRODUCER_BATCH, PULL_TIME);

  // Queue for MBPs where TX is failed
  const queueMbpWTx = new Array<MysteryBoxPrizesWTx>;
  consumeMysteryBoxPricesCheckTXsAndFilter(queueMBPs, queueMbpWTx, MAX_WORKERS, QUEUE_PULL_TIME, WORKER_PULL_TIME);

  consumeMysteryBoxPrizesWTxToCsv(queueMbpWTx, CSV_PULL_TIME, CSV_PATH);

  const intId = setInterval(function() {
    logUpdate(
      `
      \n\n\n\n\n\n\n\n\n
      mysteryBoxPricesProducerFinshed: ${mysteryBoxPricesProducerFinshed}
      queueMBPs: ${queueMBPs.length}
      mbpProdCount: ${mbpProdCount}
      
      filteredCount: ${filteredCount}
      mbpWTxNotExistErrorCount: ${mbpWTxNotExistErrorCount}
      mbpWTxFailErrorCount: ${mbpWTxFailErrorCount}
      mysteryBoxFilterFinished ${mysteryBoxFilterFinished}
      checkTxErrorCount: ${checkTxErrorCount}
      `
    );
    if (mysteryBoxPricesProducerFinshed && mysteryBoxFilterFinished && csvProdFinished) {
      clearInterval(intId);
    }
  }, 50);

}




main().catch((err) => console.error(err));
