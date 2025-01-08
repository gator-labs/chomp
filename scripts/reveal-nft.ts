import { PrismaClient } from "@prisma/client";

const { v4: uuidv4 } = require("uuid");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

console.log("Loaded environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  const chompyAroundTheWorldNfts = await prisma.revealNft.findMany({
    where: {
      nftType: "ChompyAroundTheWorld",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  for (const chompyAroundTheWorldNft of chompyAroundTheWorldNfts) {
    const chompResult = await prisma.chompResult.findFirst({
      where: {
        burnTransactionSignature: null,
        rewardTokenAmount: {
          gt: 0,
        },
        userId: chompyAroundTheWorldNft.userId,
        createdAt: {
          gt: chompyAroundTheWorldNft.createdAt,
        },
      },
    });

    if (!!chompResult?.id)
      await prisma.chompResult.update({
        data: {
          revealNftId: chompyAroundTheWorldNft.nftId,
        },
        where: {
          id: chompResult.id,
        },
      });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
