import prisma from "@/app/services/prisma";

export async function getWalletOwner(wallet: string) {
  const record = await prisma.wallet.findFirst({ where: { address: wallet } });
  return record?.userId ?? null;
}
