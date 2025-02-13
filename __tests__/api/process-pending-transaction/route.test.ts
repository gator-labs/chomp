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
  const user2 = {
    id: uuidv4(),
    username: `user2`,
  };
  const address1 = "NpemJ1dD4edGDP2CE2ijDvZsEchU2TcXZ4swPkSekmV";
  const address2 = "a726gyjcGcApcX3bBfV6zPAF1mGnyQtdL8CZVavLaGc8";
  let deckId: number;
  let questionId: number;
  const currentDate = new Date();

  beforeAll(async () => {
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
      prisma.user.createMany({
        data: [user1, user2],
      }),
      prisma.wallet.createMany({
        data: [
          {
            userId: user1.id,
            address: address1,
          },
          {
            userId: user2.id,
            address: address2,
          },
        ],
      }),
    ]);

    // Create ChompResult records for each user simulating claimed rewards
    await Promise.all([
      prisma.chompResult.createMany({
        data: [
          {
            userId: user1.id,
            result: ResultType.Revealed,
            rewardTokenAmount: 10,
            questionId,
            transactionStatus: TransactionStatus.Pending,
            createdAt: new Date(),
            needsManualReview: null,
            burnTransactionSignature:
              "52T85pvmoGzBTmad6ZeDcSL3fZcPVaACQ8GiUvGHmsivaMRrFkhtFTZv54Aaro1xKSqNr2WgjivC1o3MmRz9QaCi",
          },
          {
            userId: user2.id,
            result: ResultType.Revealed,
            rewardTokenAmount: 10,
            questionId,
            transactionStatus: TransactionStatus.Pending,
            createdAt: new Date(),
            needsManualReview: null,
            burnTransactionSignature:
              "gaLBbAbCvBCjmBEacJy5tDvh3BSaTPznr2Y8nBTcmtHnYyhw3NEMHoVSPLz4kYo2h9CuSKXXkKkh5eDi61pXmd",
          },
        ],
      }),
    ]);
  });

  afterAll(async () => {
    await deleteDeck(deckId);

    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [user1.id, user2.id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [user1.id, user2.id] },
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
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };
    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    const res = await prisma.chompResult.findMany({
      where: {
        userId: user2.id,
      },
    });

    // Assert
    expect(res[0].transactionStatus).toBe("Pending");
  });
});
