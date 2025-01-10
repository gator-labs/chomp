import { getBonkBalance, getSolBalance } from "@/app/utils/solana";
import * as Sentry from "@sentry/nextjs";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

/**
 * This API sends alert to slack when treasury balance is below a certain threshold.
 *
 * Actions performed:
 * 1. Validate the treasury balance for both SOL and BONK.
 * 2. If balance is below threshold, send alert to slack.
 *
 */

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    const fromWallet = Keypair.fromSecretKey(
      base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
    );

    const treasuryAddress = fromWallet.publicKey.toString();

    if (!treasuryAddress) {
      return new Response("Treasury address not found", { status: 500 });
    }

    const treasurySolBalance = await getSolBalance(treasuryAddress);
    const treasuryBonkBalance = await getBonkBalance(treasuryAddress);

    const minTreasurySolBalance = parseFloat(
      process.env.MIN_TREASURY_SOL_BALANCE || "0.1",
    );
    const minTreasuryBonkBalance = parseFloat(
      process.env.MIN_TREASURY_BONK_BALANCE || "2500000",
    );

    if (
      treasurySolBalance < minTreasurySolBalance ||
      // getBonkBalance returns 0 for RPC errors, so we don't trigger Sentry if low balance is just RPC failure
      (treasuryBonkBalance < minTreasuryBonkBalance && treasuryBonkBalance > 0)
    ) {
      Sentry.captureMessage(
        `Treasury balance low: ${treasurySolBalance} SOL, ${treasuryBonkBalance} BONK. Squads: https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home , Solscan: https://solscan.io/account/${treasuryAddress}#transfers`,
        {
          level: "fatal",
          tags: {
            category: "treasury-low-alert", // Custom tag to catch on Sentry
          },
          extra: {
            treasurySolBalance,
            treasuryBonkBalance,
            Refill: treasuryAddress,
            Squads: `https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home`,
            Solscan: `https://solscan.io/account/${treasuryAddress}#transfers `,
          },
        },
      );
    }
    // Process each result with same tx hash
    return new Response("Ok", { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
