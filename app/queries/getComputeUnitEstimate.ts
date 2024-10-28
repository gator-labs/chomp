import { AddressLookupTableAccount } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { CONNECTION } from "../utils/solana";

/**
 * Simulate a transaction to get the total compute units consumed
 * @param {TransactionInstruction[]} instructions - The transaction instructions
 * @param {PublicKey} payer - The public key of the payer
 * @param {AddressLookupTableAccount[]} lookupTables - The address lookup tables 
 * @returns {Promise<number | null>} - The compute units consumed, or null if unsuccessful
*/
export const getComputeUnits = async (
    instructions: TransactionInstruction[],
    payer: PublicKey,
    lookupTables: AddressLookupTableAccount[]
): Promise<number | null> => {
    const testInstructions = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ...instructions,
    ];

    const testTransaction = new VersionedTransaction(
        new TransactionMessage({
            instructions: testInstructions,
            payerKey: payer,
            recentBlockhash: (await CONNECTION.getLatestBlockhash()).blockhash,
        }).compileToV0Message(lookupTables)
    );

    const rpcResponse = await CONNECTION.simulateTransaction(testTransaction, {
        replaceRecentBlockhash: true,
        sigVerify: false,
    });

    if (rpcResponse.value.err) {
        console.error(`Simulation error: ${rpcResponse.value.err}`);
        return null;
    }

    return rpcResponse.value.unitsConsumed || null;
}