import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export const getTransactionHistory = async () => {
  const payload = await getJwtPayload();
  const userId = payload?.sub ?? "";

  if (!userId) {
    return [];
  }

  const transactionHistory = await prisma.fungibleAssetTransactionLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return transactionHistory;
};
