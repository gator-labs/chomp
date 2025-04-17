import { appendFileSync, readFileSync, writeFileSync } from "fs";
import path from "path";

//❗🙈🙉 Set the error type you want to filter by
const ERR_TYPE = "FAILED"; // "FAILED" | "NOT_EXISTS"

async function main() {
  const FILE_PATH = path.join(
    __dirname,
    "results-Thu Apr 03 2025 21:09:10 GMT-0600 (Central Standard Time).csv",
  );

  const cleanedFilePath = FILE_PATH.split(".")[0] + "-failed.csv";

  // Create or truncate the output file
  writeFileSync(cleanedFilePath, "");

  const fileTxt = readFileSync(FILE_PATH, { encoding: "utf8" });
  const fileTxtRows = fileTxt.split(/\r?\n/);

  for (let row of fileTxtRows) {
    const cols = row.split(",");

    const errStr = cols[3];

    if (errStr === ERR_TYPE) {
      appendFileSync(cleanedFilePath, row + "\n");
    }
  }
}

main().then(() => console.log("Finished!"));
