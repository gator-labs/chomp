"use server";

import { dasUmi } from "@/lib/web3";
import { publicKey } from "@metaplex-foundation/umi";
import {
  COLLECTION_KEY,
  GENESIS_COLLECTION_VALUE,
} from "../constants/genesis-nfts";
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

export const getGenesisNft = async (address: string) => {
  const usedGenesisNftIds = (await getUsedGenesisNfts()).map(
    (usedGenesisNft) => usedGenesisNft.nftId,
  );

  const assets = await dasUmi.rpc.getAssetsByOwner({
    owner: publicKey(address),
  });

  const [genesisNft] = assets.items.filter(
    (item) =>
      item.grouping.find(
        (group) =>
          group.group_key === COLLECTION_KEY &&
          group.group_value === GENESIS_COLLECTION_VALUE,
      ) &&
      !item.burnt &&
      !usedGenesisNftIds.includes(item.id),
  );

  return genesisNft;
};
