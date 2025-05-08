import { Connection, ParsedTransactionWithMeta } from "@solana/web3.js";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_CRON_URL!);

const isMainModule = require.main === module;

// ❗🙈🙉 Add name of the file you want to read here
const FILE_NAME =
  "results-Sun Apr 20 2025 12:25:32 GMT-0600 (Central Standard Time)-cleaned+1.csv";

export async function main(filename?: string) {
  let FILE_PATH: string;

  if (filename) {
    FILE_PATH = filename;
  } else {
    FILE_PATH = path.join(__dirname, FILE_NAME);
  }

  const MAX_RETRY_TIMES = 5; // How many times you want to check the record for false positives
  const PULL_TIME = 100;
  const ERR_WAIT_TIME = 400;

  const doesFilenameHasCleaned = FILE_PATH.includes("cleaned");

  let FILE_RESULT_POSFIX: string;

  if (doesFilenameHasCleaned) {
    FILE_RESULT_POSFIX = "+1.csv";
  } else {
    FILE_RESULT_POSFIX = "-cleaned.csv";
  }

  const cleanedFilePath = FILE_PATH.split(".")[0] + FILE_RESULT_POSFIX;

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\n/);

  for (let lineCount = 0; lineCount < fileTxtRows.length; lineCount++) {
    const row = fileTxtRows[lineCount];

    // Append file headers to the CSV file
    if (lineCount === 0) {
      appendFileSync(cleanedFilePath, row + "\n");
      continue;
    }

    let gotNullNTimes = 0;

    const cols = row.split(",");

    const txId = cols[1];

    console.log("Checking tx: ", txId);

    // If row is missing info ignore it
    if (txId == null) {
      console.log(`Ignoring row without txId: ${row}`);
      continue;
    }

    // Pass through rows with other errors
    const errorType = cols[2];
    if (errorType !== "NOT_EXISTS") {
      appendFileSync(cleanedFilePath, row + "\n");
      continue;
    }

    let tx: ParsedTransactionWithMeta | null = null;

    // try to get the TX several times to be totally sure it actually doesn't exist
    do {
      console.log("try ", gotNullNTimes);

      try {
        tx = await CONNECTION.getParsedTransaction(txId, {
          commitment: "finalized",
          maxSupportedTransactionVersion: 0,
        });
      } catch (err) {
        console.warn("TX ERR: ", err);

        // If network error or other error wait a bit, ignore and retry
        await new Promise((resolve) => setTimeout(resolve, ERR_WAIT_TIME));
        continue;
      }

      // If we got no TX wait a bit and try again
      if (tx == null) {
        gotNullNTimes++;
        await new Promise((resolve) => setTimeout(resolve, PULL_TIME));
        continue;
      }

      // found TX!
      console.log("Found TX: ", tx.transaction.signatures.toString());
      break;
    } while (gotNullNTimes <= MAX_RETRY_TIMES);

    console.log("Row: ", lineCount);

    // TX doesn't exist (probably)
    if (tx == null) {
      // Append to the CSV file
      appendFileSync(cleanedFilePath, row + "\n");
      console.log("Found actually not existent tx");
      console.log(tx);
    }
  } // for (let row in fileTxtRows)

  return cleanedFilePath;
}

if (isMainModule) {
  main().then(() => console.log("Finished!"));
}
