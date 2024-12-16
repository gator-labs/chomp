import { deleteDeck } from "@/app/actions/deck/deck";
import { GET } from "@/app/api/process-pending-transaction/route";
import prisma from "@/app/services/prisma";
import { ResultType, TransactionStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Constants
const secret = process.env.CRON_SECRET || "";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("GET /api/process-pending-transaction", () => {
  // Arrange
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };
  const address = "G726gyjcGcApcX3bBfV6zPAF1mGnyQtdL8CZVavLaGc7";
  let deckId: number;
  let questionId: number;
  const currentDate = new Date();

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      const deck = await prisma.deck.create({
        data: {
          deck: `deck ${currentDate}`,
          revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          stackId: null,
          deckQuestions: {
            create: {
              question: {
                create: {
                  stackId: null,
                  question: "Bonkaton question?",
                  type: "MultiChoice",
                  revealTokenAmount: 10,
                  revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  durationMiliseconds: BigInt(60000),
                  questionOptions: {
                    create: [
                      {
                        option: "A",
                        isCorrect: true,
                        isLeft: false,
                      },
                      {
                        option: "B",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "C",
                        isCorrect: false,
                        isLeft: false,
                      },
                      {
                        option: "D",
                        isCorrect: false,
                        isLeft: false,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        include: {
          deckQuestions: true,
        },
      });
      deckId = deck.id;
      questionId = deck.deckQuestions[0].questionId;
      // Create users
      await Promise.all([
        tx.user.create({
          data: user1,
        }),
        tx.wallet.create({
          data: {
            userId: user1.id,
            address,
          },
        }),
      ]);

      // Create ChompResult records for each user simulating claimed rewards
      await Promise.all([
        tx.chompResult.create({
          data: {
            userId: user1.id,
            result: ResultType.Revealed,
            rewardTokenAmount: 10,
            questionId,
            transactionStatus: TransactionStatus.Pending,
            createdAt: new Date(),
            needsManualReview: null,
            burnTransactionSignature:
              "gMaLBbAbCvBCjmBEacJy5tDvh3BSaTPznr2Y8nBTcmtHnYyhw3NEMHoVSPLz4kYo2h9CuSKXXkKkh5eDi61pXmU",
          },
        }),
      ]);
    });
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [user1.id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [user1.id] },
      },
    });
  });
  it("should have transactionStatus as completed", async () => {
    // Act
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };
    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    const res = await prisma.chompResult.findMany({
      where: {
        userId: user1.id,
      },
    });

    // Assert
    expect(res[0].transactionStatus).toBe("Completed");
  });
  it("should have transactionStatus as pending", async () => {
    // Act
    const result = await prisma.chompResult.findMany({
      where: {
        userId: user1.id,
      },
    });

    await prisma.chompResult.update({
      where: {
        userId: user1.id,
        id: result[0].id,
      },
      data: {
        transactionStatus: TransactionStatus.Pending,
        burnTransactionSignature:
          "z8G5GJzde1CPq19i4y2yX3dgFnMJEqxacatwyK4Y8dYy2wdrs3pUoR7",
      },
    });

    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };
    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    const res = await prisma.chompResult.findMany({
      where: {
        userId: user1.id,
      },
    });

    // Assert
    expect(res[0].transactionStatus).toBe("Pending");
  });
});
