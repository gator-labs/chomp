"use server";

import {
  DasApiAsset,
  DasApiAssetList,
} from "@metaplex-foundation/digital-asset-standard-api";
import { NftType } from "@prisma/client";
import {
  COLLECTION_KEY,
  GENESIS_COLLECTION_VALUE,
  GLOWBURGER_COLLECTION_VALUE,
  GLOWBURGER_DROP_TRAIT_TYPE,
  GLOWBURGER_DROP_VALUE,
  RARITY,
  RARITY_TYPE,
} from "../constants/nfts";

import { dasUmi } from "@/lib/web3";
import { publicKey } from "@metaplex-foundation/umi";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export const getRevealNfts = async () => {
  return await prisma.revealNft.findMany();
};

export const createRevealNft = async (
  nftId: string,
  userId: string,
  nftType: NftType,
) => {
  await prisma.revealNft.create({
    data: {
      nftId,
      userId,
      nftType,
    },
  });
};

export const getUnusedGenesisNft = async (assets: DasApiAssetList) => {
  const revealNftIds = (await getRevealNfts()).map(
    (revealNft) => revealNft.nftId,
  );

  const [genesisNft] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.Genesis) &&
      !revealNftIds.includes(item.id),
  );

  return genesisNft;
};

export const getUnusedGlowburgerNft = async (assets: DasApiAssetList) => {
  const revealNftIds = (await getRevealNfts()).map(
    (revealNft) => revealNft.nftId,
  );

  const [glowburgerNft] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.Glowburger) &&
      !revealNftIds.includes(item.id),
  );

  return glowburgerNft;
};

export const checkNft = async (nftAddress: string, nftType: NftType) => {
  const revealNftIds = (await getRevealNfts()).map(
    (revealNft) => revealNft.nftId,
  );

  if (revealNftIds.includes(nftAddress)) {
    return false;
  }

  const asset = await dasUmi.rpc.getAsset(publicKey(nftAddress));

  const isEligible = checkIsNftEligible(asset, nftType);

  if (!isEligible) {
    return false;
  }

  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await createRevealNft(nftAddress, payload.sub, nftType);

  return true;
};

const checkIsNftEligible = (asset: DasApiAsset, nftType: NftType) => {
  if (nftType === NftType.Glowburger) {
    return (
      !!asset.grouping.find(
        (group) =>
          group.group_key === COLLECTION_KEY &&
          group.group_value === GLOWBURGER_COLLECTION_VALUE,
      ) &&
      asset.content.metadata.attributes?.filter(
        (attribute) =>
          (attribute.trait_type === GLOWBURGER_DROP_TRAIT_TYPE &&
            attribute.value === GLOWBURGER_DROP_VALUE) ||
          (attribute.trait_type === RARITY_TYPE &&
            attribute.value === RARITY.RARE) ||
          (attribute.trait_type === RARITY_TYPE &&
            attribute.value === RARITY.LEGENDARY),
      ).length === 2 &&
      !asset.burnt
    );
  }

  if (nftType === NftType.Genesis) {
    return (
      !!asset.grouping.find(
        (group) =>
          group.group_key === COLLECTION_KEY &&
          group.group_value === GENESIS_COLLECTION_VALUE,
      ) && !asset.burnt
    );
  }
};
