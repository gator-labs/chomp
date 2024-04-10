import { start } from "solana-bankrun";
import {
	getAssociatedTokenAddressSync,
	AccountLayout,
	ACCOUNT_SIZE,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { genBonkTransferTx } from "@/app/utils/solana";
import { PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

/**
 * Mint BONK then transfer
 */
test("genBonkTransferTx", async () => {

  
	const recipientKey = new PublicKey(Keypair.generate().publicKey);
	const bonkMint = new PublicKey(
		process.env.NEXT_PUBLIC_BONK_ADDRESS!,
	);

	const gatorTreasury = Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_GATOR_TREASURY_PRIVATE_KEY!))
	const gatorBonkAta = getAssociatedTokenAddressSync(
	  bonkMint, // mint
	  gatorTreasury.publicKey // owner
	);

	const recipientAta = getAssociatedTokenAddressSync(bonkMint, recipientKey, true);
    console.log("ATA", recipientAta.toBase58())

    // Transfer BONK
	const bonkToOwn = 1_000_000_000_000n;
	const tokenAccData = Buffer.alloc(ACCOUNT_SIZE);
	AccountLayout.encode(
		{
			mint: bonkMint,
			owner: gatorTreasury.publicKey,
			amount: bonkToOwn,
			delegateOption: 0,
			delegate: PublicKey.default,
			delegatedAmount: 0n,
			state: 1,
			isNativeOption: 0,
			isNative: 0n,
			closeAuthorityOption: 0,
			closeAuthority: PublicKey.default,
		},
		tokenAccData,
	);
	const context = await start(
		[],
		[
			{
				address: recipientAta,
				info: {
					lamports: 1_000_000_000,
					data: tokenAccData,
					owner: TOKEN_PROGRAM_ID,
					executable: false,
				},
			},
		],
	);
	const client = context.banksClient;
	const rawAccount = await client.getAccount(gatorBonkAta);

    // Expect BONK to be minted
	expect(rawAccount).not.toBeNull();
	const rawAccountData = rawAccount?.data;
	const decoded = AccountLayout.decode(rawAccountData!);
	expect(decoded.amount).toBe(bonkToOwn);

    // Transfer SOL to treasury
    const payer = context.payer;
    const blockhash = context.lastBlockhash;
	const transferLamports = 1_000_000n;
	const ixs = [
		SystemProgram.transfer({
			fromPubkey: payer.publicKey,
			toPubkey: gatorTreasury.publicKey,
			lamports: transferLamports,
		}),
	];
	const tx = new Transaction();
	tx.recentBlockhash = blockhash;
	tx.add(...ixs);
	tx.sign(payer);
	await client.processTransaction(tx);

    // Expect SOL to be transferred
	const balanceAfter = await client.getBalance(gatorTreasury.publicKey);
	expect(balanceAfter).toEqual(transferLamports);

    // Then generate transfer transaction from treasury to recipient
    const transferTx = await genBonkTransferTx(recipientKey.toBase58(), context.lastBlockhash);
    transferTx.sign(gatorTreasury);
	await client.processTransaction(transferTx);

    // Expect BONK to be burned
	const receivedAccount = await client.getAccount(recipientAta);
	expect(receivedAccount).not.toBeNull();
	const receivedAccountData = receivedAccount?.data;
	const decodedReceived = AccountLayout.decode(receivedAccountData!);
	expect(decodedReceived.amount).toBe(1n);
});