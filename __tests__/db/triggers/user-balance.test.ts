import prisma from "@/app/services/prisma";
import { getCreditBalance } from "@/lib/credits/getCreditBalance";
import { getPointBalance } from "@/lib/points/getPointBalance";
import { generateUsers } from "@/scripts/utils";
import { FungibleAsset, TransactionLogType } from "@prisma/client";

describe("User balance trigger", () => {
  let users: { id: string; username: string }[];

  beforeAll(async () => {
    users = await generateUsers(2);

    await prisma.user.createMany({
      data: users,
    });
  });

  afterAll(async () => {
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { userId: { in: users.map((q) => q.id) } },
    });
    await prisma.userBalance.deleteMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: users.map((u) => u.id) } },
    });
  });

  it("should update user balance table", async () => {
    const pointsBalanceBefore = await getPointBalance(users[0].id);
    const creditsBalanceBefore = await getCreditBalance(users[0].id);

    await prisma.fungibleAssetTransactionLog.createMany({
      data: [
        {
          userId: users[0].id,
          asset: FungibleAsset.Point,
          change: 4,
          type: TransactionLogType.CreditByAdmin,
        },
        {
          userId: users[0].id,
          asset: FungibleAsset.Point,
          change: -2,
          type: TransactionLogType.CreditByAdmin,
        },
        {
          userId: users[0].id,
          asset: FungibleAsset.Point,
          change: 1.5,
          type: TransactionLogType.CreditByAdmin,
        },
        {
          userId: users[0].id,
          asset: FungibleAsset.Credit,
          change: 66,
          type: TransactionLogType.CreditByAdmin,
        },
      ],
    });

    const pointsBalanceAfter = await getPointBalance(users[0].id);
    const creditsBalanceAfter = await getCreditBalance(users[0].id);

    expect(pointsBalanceAfter - pointsBalanceBefore).toEqual(3.5);
    expect(creditsBalanceAfter - creditsBalanceBefore).toEqual(66);
  });

  it("should update user balance table (2)", async () => {
    const pointsBalanceBefore = await getPointBalance(users[1].id);
    const creditsBalanceBefore = await getCreditBalance(users[1].id);

    await prisma.fungibleAssetTransactionLog.createMany({
      data: [
        {
          userId: users[1].id,
          asset: FungibleAsset.Point,
          change: 11,
          type: TransactionLogType.CreditByAdmin,
        },
        {
          userId: users[1].id,
          asset: FungibleAsset.Credit,
          change: 44,
          type: TransactionLogType.CreditByAdmin,
        },
      ],
    });

    const pointsBalanceAfter = await getPointBalance(users[1].id);
    const creditsBalanceAfter = await getCreditBalance(users[1].id);

    expect(pointsBalanceAfter - pointsBalanceBefore).toEqual(11);
    expect(creditsBalanceAfter - creditsBalanceBefore).toEqual(44);

    // Check user0 wasn't affected

    const user0pointsBalance = await getPointBalance(users[0].id);
    const user0creditsBalance = await getCreditBalance(users[0].id);

    expect(user0pointsBalance).toEqual(3.5);
    expect(user0creditsBalance).toEqual(66);
  });
});
