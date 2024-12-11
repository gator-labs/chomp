import { sleep } from "../app/utils/sleep";
import { CONNECTION } from "../app/utils/solana";

export async function validateBonkBurned(
  burnTx: string,
  wallets: string[],
): Promise<boolean> {
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
    } catch {
      console.error("Error fetching transaction, retrying...");
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
      instruction.parsed.info.mint === process.env.NEXT_PUBLIC_BONK_ADDRESS,
  );

  if (!burnInstruction) {
    return false;
  }

  return true;
}
