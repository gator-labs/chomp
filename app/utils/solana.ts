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

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!;
const AMOUNT_TO_SEND = 1;
const DECIMALS = 5;

export const genBonkBurnTx = async (
  ownerAddress: string,
  blockhash: string,
  tokenAmount: number,
) => {
  const burnFromPublic = new PublicKey(ownerAddress);

  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS);
  let ata = await getAssociatedTokenAddress(
    bonkPublic, // mint
    burnFromPublic, // owner
  );

  const tx = new Transaction();

  const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100000,
  });

  tx.add(priorityFeeInstruction);

  tx.add(
    createBurnCheckedInstruction(
      ata,
      bonkPublic,
      burnFromPublic,
      tokenAmount * 10 ** DECIMALS,
      DECIMALS,
    ),
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = burnFromPublic;

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
