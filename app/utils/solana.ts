import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!;
const COMPUTE_UNIT_FIX = 5000;
const DECIMALS = 5;
const PRIORITY_RATE = 25000;

export const genBonkBurnTx = async (
  ownerAddress: string,
  blockhash: string,
  tokenAmount: number,
) => {
  const burnFromPublic = new PublicKey(ownerAddress); // user address
  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS); // bonk public address

  let ata = await getAssociatedTokenAddress(bonkPublic, burnFromPublic);

  const instructions = [];

  const burnTxInstruction = createBurnCheckedInstruction(
    ata,
    bonkPublic,
    burnFromPublic,
    tokenAmount * 10 ** DECIMALS,
    DECIMALS,
  );

  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: COMPUTE_UNIT_FIX * 1.25,
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: PRIORITY_RATE,
  });

  instructions.push(modifyComputeUnits);
  instructions.push(addPriorityFee);
  instructions.push(burnTxInstruction);

  const message = new TransactionMessage({
    payerKey: burnFromPublic,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  return transaction;
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
