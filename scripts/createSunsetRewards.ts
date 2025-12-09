/**
 * Creates sunset reward allowlist entries for the top 100 users by points.
 *
 * This script:
 * 1. Fetches all users with their point balances
 * 2. Sorts them by points (descending)
 * 3. Takes the top 100
 * 4. Creates an allowlist entry for each user (using their wallet address)
 * 5. Creates a campaign mystery box allowlist entry
 * 6. Creates a sunset reward record with their rank, points, and proportional BONK amount
 *
 * BONK Distribution:
 * Each user receives: 250M BONK * (user's points / total points of top 100)
 */

const { PrismaClient, FungibleAsset } = require("@prisma/client");

const prisma = new PrismaClient();

const SUNSET_CAMPAIGN_ID = "7140e00f-d6da-11f0-8376-00e04c6804ae";

// Total BONK pool: 250M
const TOTAL_BONK_POOL = BigInt("250000000");

function calculateBonkReward(userPoints: number, totalPoints: number): string {
  if (totalPoints === 0) return "0";

  // Calculate: 250M * (userPoints / totalPoints)
  // Using BigInt for precision
  const userPointsBigInt = BigInt(Math.floor(userPoints));
  const totalPointsBigInt = BigInt(Math.floor(totalPoints));

  const reward = (TOTAL_BONK_POOL * userPointsBigInt) / totalPointsBigInt;

  return reward.toString();
}

async function main() {
  console.log("Fetching all users with point balances...");

  // Get all users with their point balances
  const userBalances = await prisma.userBalance.findMany({
    where: {
      asset: FungibleAsset.Point,
    },
    include: {
      user: {
        include: {
          wallets: true,
        },
      },
    },
    orderBy: {
      balance: "desc",
    },
    take: 100,
  });

  console.log(`Found ${userBalances.length} users with points`);

  // Filter users who have at least one wallet
  const usersWithWallets = userBalances.filter(
    (ub: any) => ub.user.wallets && ub.user.wallets.length > 0
  );

  console.log(
    `${usersWithWallets.length} users have wallet addresses`
  );

  if (usersWithWallets.length === 0) {
    console.log("No users with wallets found. Exiting.");
    return;
  }

  // Calculate total points across all top 100 users
  const totalPoints = usersWithWallets.reduce(
    (sum: number, ub: any) => sum + ub.balance.toNumber(),
    0
  );

  console.log(`\nTotal points across top ${usersWithWallets.length} users: ${totalPoints.toLocaleString()}`);

  // Prepare data for batch insert
  const allowlistData: Array<{
    address: string;
    points: number;
    rank: number;
    bonkReward: string;
  }> = [];

  for (let i = 0; i < usersWithWallets.length; i++) {
    const userBalance = usersWithWallets[i];
    const rank = i + 1;
    const points = userBalance.balance.toNumber();
    const bonkReward = calculateBonkReward(points, totalPoints);

    // Use the first wallet address
    const walletAddress = userBalance.user.wallets[0].address;

    // Calculate BONK amount in human-readable format for logging
    const bonkAmount = (Number(bonkReward)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const percentageOfTotal = ((points / totalPoints) * 100).toFixed(2);

    allowlistData.push({
      address: walletAddress,
      points,
      rank,
      bonkReward,
    });

    console.log(
      `Rank ${rank}: ${walletAddress} - ${points.toLocaleString()} points (${percentageOfTotal}%) - ${bonkAmount} BONK`
    );
  }

  console.log("\nCreating allowlist entries and sunset rewards...");

  // Create allowlist entries and sunset rewards in a transaction
  let successCount = 0;
  let errorCount = 0;

  for (const entry of allowlistData) {
    try {
      await prisma.$transaction(async (tx: any) => {
        // First, ensure the address exists in the master allowlist
        await tx.mysteryBoxAllowlist.upsert({
          where: {
            address: entry.address,
          },
          create: {
            address: entry.address,
          },
          update: {},
        });

        // Then create the sunset reward
        const sunsetReward = await tx.sunsetReward.create({
          data: {
            rank: entry.rank,
            points: entry.points,
            bonkReward: entry.bonkReward,
          },
        });

        // Finally, create or update the campaign allowlist entry with the sunset reward
        await tx.campaignMysteryBoxAllowlist.create({
          data: {
            campaignMysteryBoxId: SUNSET_CAMPAIGN_ID,
            address: entry.address,
            sunsetRewardId: sunsetReward.id,
          },
        });
      });

      successCount++;
    } catch (error) {
      errorCount++;
      console.error(
        `Error creating entry for ${entry.address} (rank ${entry.rank}):`,
        error
      );
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Successfully created: ${successCount} entries`);
  console.log(`Errors: ${errorCount} entries`);
  console.log("\nSunset rewards created successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Fatal error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
