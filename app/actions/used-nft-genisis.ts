"use server";

import prisma from "../services/prisma";

export const getUsedGenisisNfts = async () => {
  return prisma.usedGenisisNft.findMany();
};

export const createUsedGenisisNft = async (
  nftId: string,
  walletAddress: string,
) => {
  await prisma.usedGenisisNft.create({
    data: {
      nftId,
      walletAddress,
    },
  });
};
