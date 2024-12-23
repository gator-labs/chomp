import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!;
const DECIMALS = 5;
export const MINIMUM_SOL_BALANCE_FOR_TRANSACTION = 0.000005;

export const genBonkBurnTx = async (
  ownerAddress: string,
  tokenAmount: number,
) => {
  const burnFromPublic = new PublicKey(ownerAddress); // user address
  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS); // bonk public address

  const ata = await getAssociatedTokenAddress(bonkPublic, burnFromPublic);

  const tx = new Transaction();

  const { blockhash, lastValidBlockHeight } =
    await CONNECTION.getLatestBlockhash("confirmed");

  // required to get the appropriate priority fees
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = burnFromPublic;

  // It is recommended to add the compute limit instruction before adding other instructions
  const computeUnitFix = 4960;

  // Buffer to make sure the transaction doesn't fail because of less compute units
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(computeUnitFix * 1.1),
  });
  tx.add(modifyComputeUnits);

  const burnTxInstruction = createBurnCheckedInstruction(
    ata,
    bonkPublic,
    burnFromPublic,
    tokenAmount * 10 ** DECIMALS,
    DECIMALS,
  );
  tx.add(burnTxInstruction);

  let estimateFee = await getRecentPrioritizationFees(tx);

  // Verify the estimateFee is not null due to RPC request failure in some cases
  if (estimateFee === null) {
    for (let i = 0; i < 2; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      estimateFee = await getRecentPrioritizationFees(tx);
      if (estimateFee !== null) break;
    }

    // Set median priority fee if estimateFee is still null
    if (estimateFee === null) {
      estimateFee = {
        result: {
          priorityFeeLevels: {
            high: HIGH_PRIORITY_FEE,
          },
        },
      };
    }
  }

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: Math.round(estimateFee?.result?.priorityFeeLevels?.high),
  });

  tx.add(addPriorityFee);

  // Add latest blockhash and block height to make sure tx success rate
  const {
    blockhash: newBlockhash,
    lastValidBlockHeight: newLastValidBlockHeight,
  } = await CONNECTION.getLatestBlockhash("finalized");

  tx.recentBlockhash = newBlockhash;
  tx.lastValidBlockHeight = newLastValidBlockHeight;
  return tx;
};

export const getBonkBalance = async (address: string): Promise<number> => {
  if (!address) {
    return 0;
  }

  try {
    const walletPublickey = new PublicKey(address);
    const bonkPublicKey = new PublicKey(BONK_PUBLIC_ADDRESS);
    const balance = await CONNECTION.getParsedTokenAccountsByOwner(
      walletPublickey,
      {
        mint: bonkPublicKey,
      },
    );

    if (balance.value.length === 0) {
      return 0;
    }

    return (
      balance.value[0].account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
    );
  } catch {
    return 0;
  }
};

export const getSolBalance = async (address: string): Promise<number> => {
  if (!address) {
    return 0;
  }

  const walletPublickey = new PublicKey(address);
  const balance = await CONNECTION.getBalance(walletPublickey);

  return balance / LAMPORTS_PER_SOL;
};

export function isValidSignature(
  signature: string | null | undefined,
): boolean {
  // Null is allowed but no empty string or random string
  if (signature === null || signature === undefined) return true;
  if (signature.length < 85 || signature.length > 89)
    return false;
  try {
    // If it's a valid base58 encoded string, it will not throw an error
    bs58.decode(signature);
    return true;
  } catch {
    return false;
  }
}
