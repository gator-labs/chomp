# Mystery Box Script

Follow these steps to identify problematic transactions:

1. Run the mystery-box-find-unsuccessful-prices.ts script to generate a CSV file containing all problematic transactions. Note that this script may take several hours to complete execution.

2. Once the CSV file is generated, we need to clean it for false positives. For some reason, the Solana RPC API falsely returns that a tx does not exist sometimes, even 5 times in a row! So you need to run and re-run this file until the transaction count of your file stops changing; in my case it was three times.

❗Make sure to fill the variables FILE_NAME and IS_RE_CLEAN with the correct information.

3. (Optional) If you want to separate your file by error type for better handling, you can use results-clean-false-positives.ts file to generate a new file with your filtered MBP.

4. (Optional) You can run results-add-dates.ts to add dates to MBP. TODO: Might be better to edit the script to add them from the beginning.

5. Create each transaction manually to pay users and at the end of each record add the TX id to update the DB with `mystery-box-price-update-tx.ts`. That's it, your users are happier now!

## Commands

```bash
yarn dev:mystery-box-prices-inspect-txs
yarn dev:mystery-box-prices-inspect-txs-clean
yarn dev:mystery-box-prices-filter-failed
yarn dev:mystery-box-prices-add-dates
yarn dev:mystery-box-prices-update-tx
```

