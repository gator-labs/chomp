import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import { CONNECTION } from "../../app/utils/solana";

async function main() {
  const FILE_PATH = path.join(
    __dirname,
    "results-Thu Apr 03 2025 21:09:10 GMT-0600 (Central Standard Time)-cleaned+1.csv",
  );
  const PULL_TIME = 100;
  const ERR_WAIT_TIME = 400;

  // set true if you are cleaning the same file again
  const IS_RE_CLEAN = true;

  const FILE_RESULT_POSFIX = IS_RE_CLEAN ? "+1.csv" : "-cleaned.csv";

  const cleanedFilePath = FILE_PATH.split(".")[0] + FILE_RESULT_POSFIX;

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\r?\n/);

  let lineCount = 0;
  for (let row of fileTxtRows) {
    let gotNullNTimes = 0;
    const MAX_RETRY_TIMES = 5;

    const cols = row.split(",");

    const txId = cols[1];

    console.log("Checking tx: ", txId);

    if (txId == null) {
      // If it was EOF is all good
      throw new Error("ERROR: Record without TX ID OR END OF FILE");
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
        console.error("TX ERR: ", err);

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

    lineCount++;
    console.log("Row: ", lineCount);

    // TX doesn't exist (probably)
    if (tx == null) {
      // Append to the CSV file
      appendFileSync(cleanedFilePath, row + "\n");
      console.log("Found actually not existent tx");
      console.log(tx);
    }
  } // for (let row in fileTxtRows)
}

main().then(() => console.log("Finished!"));
