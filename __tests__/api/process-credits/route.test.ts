import { GET } from "@/app/api/cron/process-credits/route";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import { CreditPack } from "@prisma/client";
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
  const address3 = "GmUV9W6FqNPuHCwLLu9o9QyrR13CDYkP7Mkd3bZod16A";

  const validTxHash =
    "48CCstjYwRC5DaBxGP1cdXdgmsAWvBv21F9BNk7Ln8xA2VFpKyKFrzpHHKQj4WcqRbcFevw5rHypoP4zUMYQHvSR";
  const validTxHash2 =
    "3rEHsyEXRuVcrD6R1kQH1D8t4cHc2oTMqVbJYqYku1FXV1WBiWW1JPSX13hJpNBk6PzjMhYFV775M58DAdpNofi3";
  const invalidTxHash =
    "gaLBbAbCvBCjmBEacJy5tDvh3BSaTPznr2Y8nBTcmtHnYyhw3NEMHoVSPLz4kYo2h9CuSKXXkKkh5eDi61pXmd";

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  let creditPack: CreditPack;

  beforeAll(async () => {
    users = await generateUsers(3);

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [
        { userId: users[0].id, address: address1 },
        { userId: users[1].id, address: address2 },
        { userId: users[2].id, address: address3 },
      ],
    });

    creditPack = await prisma.creditPack.create({
      data: {
        amount: 100,
        costPerCredit: "0.00002",
        originalCostPerCredit: "0.001",
        isActive: true,
      },
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
      // Valid transaction with credit pack
      prisma.chainTx.create({
        data: {
          hash: validTxHash2,
          wallet: address3,
          type: EChainTxType.CreditPurchase,
          solAmount: "0.002",
          creditPackId: creditPack.id,
          recipientAddress: "CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9",
          createdAt: threeDaysAgo,
        },
      }),
    ]);
  });

  afterAll(async () => {
    await prisma.creditPack.deleteMany({
      where: {
        id: creditPack.id,
      },
    });

    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        userId: { in: [users[0].id, users[1].id, users[2].id] },
      },
    });

    await prisma.chainTx.deleteMany({
      where: {
        hash: { in: [validTxHash, validTxHash2, invalidTxHash] },
      },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: { in: [users[0].id, users[1].id, users[2].id] },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: [users[0].id, users[1].id, users[2].id] },
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

    const creditLog2 = await prisma.fungibleAssetTransactionLog.findFirst({
      where: {
        userId: users[2].id,
        chainTxHash: validTxHash2,
      },
    });

    // Check credit pack was applied
    expect(chainTx?.status).toBe(EChainTxStatus.Confirmed);
    expect(Number(creditLog2?.change)).toBe(100);
    expect(creditLog2?.creditPackId).toBe(creditPack.id);
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
