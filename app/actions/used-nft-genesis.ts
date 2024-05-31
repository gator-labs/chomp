"use server";

import prisma from "../services/prisma";

export const getUsedGenesisNfts = async () => {
  return prisma.usedGenesisNft.findMany();
};

export const createUsedGenesisNft = async (
  nftId: string,
  walletAddress: string,
) => {
  await prisma.usedGenesisNft.create({
    data: {
      nftId,
      walletAddress,
    },
  });
};
