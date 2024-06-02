"use server";

import prisma from "../services/prisma";

export const getUsedGenesisNfts = async () => {
  return await prisma.usedGenesisNft.findMany();
};

export const createUsedGenesisNft = async (nftId: string, userId: string) => {
  await prisma.usedGenesisNft.create({
    data: {
      nftId,
      userId,
    },
  });
};
