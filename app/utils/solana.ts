import { Transaction, Connection, PublicKey } from "@solana/web3.js";
import { createBurnCheckedInstruction, getAssociatedTokenAddress, burn } from "@solana/spl-token";

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!
const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
const AMOUNT_TO_SEND = 1 // 1 => 0.00001 BONK
const DECIMALS = 5

export const genBonkBurnTx = async (ownerAddress: string, blockhash: string) => {
    const burnFromPublic = new PublicKey(ownerAddress);
                  
    const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS);
    let ata = await getAssociatedTokenAddress(
      bonkPublic, // mint
      burnFromPublic // owner
    );

    const tx = new Transaction();
    tx.add(
      createBurnCheckedInstruction(
        ata,
        bonkPublic,
        burnFromPublic,
        AMOUNT_TO_SEND,
        DECIMALS 
      )
    );

    tx.recentBlockhash = blockhash;
    tx.feePayer = burnFromPublic

    return tx
}