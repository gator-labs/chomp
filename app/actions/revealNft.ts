"use server";

import {
  DasApiAsset,
  DasApiAssetList,
} from "@metaplex-foundation/digital-asset-standard-api";
import { NftType } from "@prisma/client";
import {
  CHOMPY_AND_FRIEDNS_DROP_VALUE,
  CHOMPY_AROUND_THE_WORLD_COLLECTION_VALUE,
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
  const revealNftIds = (
    await prisma.revealNft.findMany({
      select: { nftId: true },
    })
  ).map((nft) => nft.nftId);

  const [genesisNft] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.Genesis) &&
      !revealNftIds.includes(item.id),
  );

  return genesisNft;
};

export const getUnusedChompyAndFriendsNft = async (assets: DasApiAssetList) => {
  const revealNftIds = (
    await prisma.revealNft.findMany({
      select: { nftId: true },
    })
  ).map((nft) => nft.nftId);

  const [genesisNft] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.ChompyAndFriends) &&
      !revealNftIds.includes(item.id),
  );

  return genesisNft;
};

export const getUnusedGlowburgerNft = async (assets: DasApiAssetList) => {
  const revealNftIds = (
    await prisma.revealNft.findMany({
      select: { nftId: true },
    })
  ).map((nft) => nft.nftId);

  const [glowburgerNft] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.Glowburger) &&
      !revealNftIds.includes(item.id),
  );

  return glowburgerNft;
};

export const getUnusedChompyAroundTheWorldNft = async (
  assets: DasApiAssetList,
) => {
  const revealNftIds = (
    await prisma.revealNft.findMany({
      select: { nftId: true },
    })
  ).map((nft) => nft.nftId);

  const [chompyAroundTheWorld] = assets.items.filter(
    (item) =>
      checkIsNftEligible(item, NftType.ChompyAroundTheWorld) &&
      !revealNftIds.includes(item.id),
  );

  return chompyAroundTheWorld;
};

export const checkNft = async (nftAddress: string, nftType: NftType) => {
  const revealNftIds = (
    await prisma.revealNft.findMany({
      select: { nftId: true },
    })
  ).map((nft) => nft.nftId);

  if (revealNftIds.includes(nftAddress)) {
    return false;
  }

  const asset = await (dasUmi.rpc as any).getAsset(publicKey(nftAddress));

  const isEligible = checkIsNftEligible(asset, nftType);

  if (!isEligible) throw new Error("This nft is not eligible!");

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

  if (nftType === NftType.ChompyAroundTheWorld) {
    return (
      !!asset.grouping.find(
        (group) =>
          group.group_key === COLLECTION_KEY &&
          group.group_value === CHOMPY_AROUND_THE_WORLD_COLLECTION_VALUE,
      ) && !asset.burnt
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

  if (nftType === NftType.ChompyAndFriends) {
    return (
      !!asset.grouping.find(
        (group) =>
          group.group_key === COLLECTION_KEY &&
          group.group_value === GENESIS_COLLECTION_VALUE,
      ) &&
      !!asset.content.metadata.attributes?.find(
        (attribute) =>
          (attribute.trait_type === GLOWBURGER_DROP_TRAIT_TYPE &&
            attribute.value === CHOMPY_AND_FRIEDNS_DROP_VALUE) ||
          (attribute.trait_type === RARITY_TYPE &&
            attribute.value === RARITY.ULTIMATE),
      ) &&
      !asset.burnt
    );
  }
};
