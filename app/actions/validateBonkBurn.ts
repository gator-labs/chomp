import { sleep } from "../utils/sleep";
import { CONNECTION } from "../utils/solana";

export async function validateBonkBurned(
  burnTx: string,
  wallets: string[],
  SECRET: string,
): Promise<boolean> {
  if (!burnTx && SECRET !== process.env.CRON_SECRET) {
    return false;
  }

  let transaction;
  const interval = 1000;
  const maxRetries = 5;
  let attempts = 0;

  while (!transaction && attempts < maxRetries) {
    try {
      transaction = await CONNECTION.getParsedTransaction(burnTx, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error("Error fetching transaction, retrying...", error);
    }

    if (!transaction) {
      attempts++;
      await sleep(interval);
    }
  }

  if (!transaction || transaction.meta?.err) {
    return false;
  }

  const burnInstruction = transaction.transaction.message.instructions.find(
    (instruction) =>
      "parsed" in instruction &&
      instruction.parsed.type === "burnChecked" &&
      wallets.includes(instruction.parsed.info.authority) &&
      instruction.parsed.info.mint ===
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  );

  if (!burnInstruction) {
    return false;
  }

  return true;
}
