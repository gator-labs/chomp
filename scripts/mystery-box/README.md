# Mystery Box Scripts

Follow these steps to identify problematic transactions:

## 1 Find problematic MysteryBoxPrizes

Run this script to generate a CSV file containing all problematic transactions. Note that this script may take several hours to complete execution.

You can specify a date from which to start analyzing MysteryBoxPrizes by opening the file `mystery-box-find-unsuccessful-prizes.ts` and setting up the variable `START_AT_CREATED_AT` with a valid text date. If you are analyzing the complete replicate DB, the script will take several hours.

Run:
`yarn dev:mystery-box-prizes-find-errors-txs`

This script will generate a CSV file with the following columns:

`mbpId	mbpClaimHash	error	ctFinalizedAt	mbUserId	chainTxTokenAmount	chainTxRecipientAddress`

The CSV output file will be named something like: `results-Sat Apr 19 2025 15:07:13 GMT-0600 (Central Standard Time).csv`, in this folder.

## 2 Clean False Positives

Once the CSV file is generated, we need to clean it for false positives. For some reason, the Solana RPC API falsely returns that a tx does not exist sometimes, even 5 times in a row waiting 500ms between calls! So you need to run and re-run this file until the transaction count of your file stops changing; in my case it was three times.

Open the file `./results-clean-false-positives.ts` and on the first lines fill the variable `FILE_NAME` with the name of the output file from step 1. 

Run:
`yarn dev:mystery-box-prizes-inspect-txs-clean`

Remember that every time you run it it generates a new file, so you need to edit `FILE_NAME` and run it again.

## 3 Update Database with new TX Info

After analyzing your file, manually send the owned BONK to our users.

Then you can add a new column named `paidTx` (name doesn't matter, it's the position seven) and add the TxId there.

Pro tip: You can make one transaction per user if you like. The script will re-use the ChainTX if it already exists.

Run: 

`yarn dev:mystery-box-prizes-update-tx`

