import { getUsersTotalClaimedAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { ResultType, TransactionStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

jest.mock("@/app/utils/auth");

describe("getUsersTotalClaimedAmount", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  const user2 = {
    id: uuidv4(),
    username: `user2`,
  };

  const user3 = {
    id: uuidv4(),
    username: `user3`,
  };

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Create users
      await Promise.all([
        tx.user.create({ data: user1 }),
        tx.user.create({ data: user2 }),
        tx.user.create({ data: user3 }),
      ]);

      // Create ChompResult records for each user simulating claimed rewards
      await Promise.all([
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Claimed,
            rewardTokenAmount: 100,
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature: "0123",
            createdAt: new Date(),
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Claimed,
            rewardTokenAmount: 50,
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature: "0123",
            createdAt: new Date(),
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user2.id,
            result: ResultType.Claimed,
            rewardTokenAmount: 200,
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature: "0123",
            createdAt: new Date(),
          },
        }),
        tx.chompResult.create({
          data: {
            userId: user3.id,
            result: ResultType.Claimed,
            rewardTokenAmount: 300,
            transactionStatus: TransactionStatus.Completed,
            burnTransactionSignature: "0123",
            createdAt: new Date(),
          },
        }),
      ]);
    });
  });

  afterAll(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: {
          userId: { in: [user1.id, user2.id, user3.id] },
        },
      });
      await tx.user.deleteMany({
        where: {
          id: { in: [user1.id, user2.id, user3.id] },
        },
      });
    });
  });

  it("should return the total claimed amount for user1", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user1.id });
    const totalClaimedAmount = await getUsersTotalClaimedAmount();

    expect(totalClaimedAmount).toBe(150); // 100 + 50
  });

  it("should return the total claimed amount for user2", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user2.id });
    const totalClaimedAmount = await getUsersTotalClaimedAmount();

    expect(totalClaimedAmount).toBe(200); // Single claim of 200
  });

  it("should return the total claimed amount for user3", async () => {
    (authGuard as jest.Mock).mockResolvedValue({ sub: user3.id });
    const totalClaimedAmount = await getUsersTotalClaimedAmount();

    expect(totalClaimedAmount).toBe(300); // Single claim of 300
  });
});
