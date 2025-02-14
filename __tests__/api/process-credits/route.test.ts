import { GET } from "@/app/api/cron/process-credits/route";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import Decimal from "decimal.js";

const secret = process.env.CRON_SECRET || "";
const solPerCreditCost = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT ?? 0;

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Transaction details are hardcoded in the test
jest.mock("@/app/utils/getSolPaymentAddress", () => ({
  getSolPaymentAddress: jest
    .fn()
    .mockResolvedValue("CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9"),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("GET /api/cron/process-credits", () => {
  // Arrange
  let users: { id: string; username: string }[];
  const address1 = "2K88XKbcHW5kLNVyKrgWQUoW3dJPYUjMXJreAoVHWTKW";
  const address2 = "b726gyjcGcApcX3bBfV6zPAF1mGnyQtdL8CZVavLaGc6";

  const validTxHash =
    "48CCstjYwRC5DaBxGP1cdXdgmsAWvBv21F9BNk7Ln8xA2VFpKyKFrzpHHKQj4WcqRbcFevw5rHypoP4zUMYQHvSR";
  const invalidTxHash =
    "gaLBbAbCvBCjmBEacJy5tDvh3BSaTPznr2Y8nBTcmtHnYyhw3NEMHoVSPLz4kYo2h9CuSKXXkKkh5eDi61pXmd";

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    users = await generateUsers(2);

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [
        { userId: users[0].id, address: address1 },
        { userId: users[1].id, address: address2 },
      ],
    });

    // Create ChainTx records
    await Promise.all([
      // Valid transaction
      prisma.chainTx.create({
        data: {
          hash: validTxHash,
          wallet: address1,
          type: EChainTxType.CreditPurchase,
          solAmount: "0.25",
          recipientAddress: "CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9",
          createdAt: threeDaysAgo,
        },
      }),
      // Invalid transaction
      prisma.chainTx.create({
        data: {
          hash: invalidTxHash,
          wallet: address2,
          type: EChainTxType.CreditPurchase,
          solAmount: "0.001",
          recipientAddress: "49meww3iQ9jznXWnpABUna4kpaWvxnxEz1xsN5PmtTsx",
          createdAt: threeDaysAgo,
        },
      }),
    ]);
  });

  afterAll(async () => {
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: { in: [users[0].id, users[1].id] },
      },
    });

    await prisma.chainTx.deleteMany({
      where: {
        hash: { in: [validTxHash, invalidTxHash] },
      },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [users[0].id, users[1].id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [users[0].id, users[1].id] },
      },
    });
  });

  it("should process valid transaction successfully", async () => {
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };

    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    // Assert
    const chainTx = await prisma.chainTx.findUnique({
      where: {
        hash: validTxHash,
      },
    });

    const creditLog = await prisma.fungibleAssetTransactionLog.findFirst({
      where: {
        userId: users[0].id,
        chainTxHash: validTxHash,
      },
    });

    const expectedChange = new Decimal("0.25").div(solPerCreditCost).toNumber();

    expect(chainTx?.status).toBe(EChainTxStatus.Confirmed);
    expect(Number(creditLog?.change)).toBe(expectedChange);
  });

  it("should mark invalid transaction as failed", async () => {
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };
    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    // Assert
    const chainTx = await prisma.chainTx.findUnique({
      where: {
        hash: invalidTxHash,
      },
    });

    expect(chainTx?.failedAt).toBeDefined();
    expect(chainTx?.status).toBe(EChainTxStatus.New);
  });

  it("should skip already failed transactions", async () => {
    // Arrange
    await prisma.chainTx.update({
      where: {
        hash: invalidTxHash,
      },
      data: {
        failedAt: new Date(),
      },
    });

    // Act
    const mockHeaders = {
      get: jest.fn().mockReturnValue(`Bearer ${secret}`),
    };
    const mockRequest = {
      headers: mockHeaders,
    } as unknown as Request;

    await GET(mockRequest);

    // Assert
    const chainTx = await prisma.chainTx.findUnique({
      where: {
        hash: invalidTxHash,
      },
    });

    expect(chainTx?.status).toBe(EChainTxStatus.New);
    expect(chainTx?.failedAt).toBeDefined();
  });
});
