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
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!;
const AMOUNT_TO_SEND = 1;
const DECIMALS = 5;

export const genBonkBurnTx = async (
  ownerAddress: string,
  blockhash: string,
  tokenAmount: number,
) => {
  const burnFromPublic = new PublicKey(ownerAddress); // user address
  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS); // bonk public address

  let ata = await getAssociatedTokenAddress(bonkPublic, burnFromPublic);

  const tx = new Transaction();

  const burnTxInstruction = createBurnCheckedInstruction(
    ata,
    bonkPublic,
    burnFromPublic,
    tokenAmount * 10 ** DECIMALS,
    DECIMALS,
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = burnFromPublic;

  let estimateFee = await getRecentPrioritizationFees(tx);

  // Verify the estimateFee is not null due to RPC request failure in some cases
  if (estimateFee === null) {
    for (let i = 0; i < 2; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      estimateFee = await getRecentPrioritizationFees(tx);
      if (estimateFee !== null) break;
    }
    
    // Set median priority fee if estimateFee is still null
    if (estimateFee === null) {
      estimateFee = {
        result: {
          priorityFeeLevels: {
            high: 5000,
          },
        },
      };
    }
  }
  
  const computeUnitFix = 5000;

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: computeUnitFix * 1.25,
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: estimateFee?.result?.priorityFeeLevels?.high,
  });

  tx.add(modifyComputeUnits);
  tx.add(addPriorityFee);
  tx.add(burnTxInstruction);

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
