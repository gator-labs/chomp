import { start } from "solana-bankrun";
import {
getAssociatedTokenAddressSync,
AccountLayout,
ACCOUNT_SIZE,
TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { genBonkBurnTx } from "@/app/utils/solana";
import { PublicKey, Transaction, SystemProgram, Keypair } from "@solana/web3.js";

/\*\*

- Mint BONK then burn it
  \*/
  test("genBonkBurnTx", async () => {
  const ownerSecret = Keypair.generate();
  const owner = ownerSecret.publicKey
  const bonkMint = new PublicKey(
  process.env.NEXT_PUBLIC_BONK_ADDRESS!,
  );
  const ata = getAssociatedTokenAddressSync(bonkMint, owner, true);
  console.log("ATA", ata.toBase58())

      // Transfer BONK
      const bonkToOwn = 1_000_000_000_000n;
      const tokenAccData = Buffer.alloc(ACCOUNT_SIZE);
      AccountLayout.encode(
      	{
      		mint: bonkMint,
      		owner,
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
      			address: ata,
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
      const rawAccount = await client.getAccount(ata);

      // Expect BONK to be minted
      expect(rawAccount).not.toBeNull();
      const rawAccountData = rawAccount?.data;
      const decoded = AccountLayout.decode(rawAccountData!);
      expect(decoded.amount).toBe(bonkToOwn);

      // Transfer SOL
      const payer = context.payer;
      const blockhash = context.lastBlockhash;
      const transferLamports = 1_000_000n;
      const ixs = [
      	SystemProgram.transfer({
      		fromPubkey: payer.publicKey,
      		toPubkey: owner,
      		lamports: transferLamports,
      	}),
      ];
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.add(...ixs);
      tx.sign(payer);
      await client.processTransaction(tx);

      // Expect SOL to be transferred
      const balanceAfter = await client.getBalance(owner);
      expect(balanceAfter).toEqual(transferLamports);

      // Then generate burn transaction
      const burnTx = await genBonkBurnTx(owner.toBase58(), context.lastBlockhash);
      burnTx.sign(ownerSecret);
      await client.processTransaction(burnTx);

      // Expect BONK to be burned
      const burnedAccount = await client.getAccount(ata);
      expect(burnedAccount).not.toBeNull();
      const burnedAccountData = burnedAccount?.data;
      const decodedBurned = AccountLayout.decode(burnedAccountData!);
      expect(decodedBurned.amount).toBe(bonkToOwn - 1n);

  });
