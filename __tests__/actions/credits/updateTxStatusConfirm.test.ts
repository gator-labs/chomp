import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { updateTxStatusToConfirmed } from "@/lib/credits/updateTxStatusConfirm";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import { CreditPack } from "@prisma/client";
import {
  EChainTxStatus,
  EChainTxType,
  TransactionLogType,
} from "@prisma/client";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("updateTxStatusToConfirmed", () => {
  const CREDIT_CONFIRM_SIGNATURE = "CREDIT_CONFIRM_SIGNATURE_" + "X".repeat(62);
  const CREDIT_CONFIRM_SIGNATURE_2 =
    "CREDIT_CONFIRM_SIGNATURE_" + "Y".repeat(62);
  let user: { id: string; wallet: string };

  let creditPack: CreditPack;

  beforeAll(async () => {
    const users = await generateUsers(1);
    user = {
      id: users[0].id,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    await prisma.user.create({
      data: {
        id: user.id,
      },
    });

    await prisma.wallet.create({
      data: {
        address: user.wallet,
        userId: user.id,
      },
    });

    creditPack = await prisma.creditPack.create({
      data: {
        amount: 100,
        costPerCredit: "0.00002",
        originalCostPerCredit: "0.001",
        isActive: true,
      },
    });

    await prisma.chainTx.create({
      data: {
        hash: CREDIT_CONFIRM_SIGNATURE,
        status: EChainTxStatus.New,
        solAmount: "0.002",
        wallet: user.wallet,
        feeSolAmount: "0",
        recipientAddress: faker.string.hexadecimal({
          length: { min: 32, max: 42 },
        }),
        type: EChainTxType.CreditPurchase,
      },
    });

    await prisma.chainTx.create({
      data: {
        hash: CREDIT_CONFIRM_SIGNATURE_2,
        status: EChainTxStatus.New,
        solAmount: "0.003",
        wallet: user.wallet,
        creditPackId: creditPack.id,
        feeSolAmount: "0",
        recipientAddress: faker.string.hexadecimal({
          length: { min: 32, max: 42 },
        }),
        type: EChainTxType.CreditPurchase,
      },
    });
  });

  afterAll(async () => {
    await prisma.creditPack.deleteMany({
      where: {
        id: creditPack.id,
      },
    });

    // Clean up all created records
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: {
        chainTxHash: {
          in: [CREDIT_CONFIRM_SIGNATURE, CREDIT_CONFIRM_SIGNATURE_2],
        },
      },
    });
    await prisma.chainTx.deleteMany({
      where: { wallet: user.wallet },
    });
    await prisma.wallet.delete({
      where: { address: user.wallet },
    });
    await prisma.user.delete({
      where: { id: user.id },
    });
  });

  it("should create update tx status to confirmed", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });

    const result = await updateTxStatusToConfirmed(CREDIT_CONFIRM_SIGNATURE, 1);

    const chainTx = await prisma.chainTx.findFirst({
      where: { hash: CREDIT_CONFIRM_SIGNATURE },
    });

    const fatl = await prisma.fungibleAssetTransactionLog.findFirst({
      where: { chainTxHash: CREDIT_CONFIRM_SIGNATURE },
    });

    expect(chainTx).toBeDefined();
    expect(chainTx?.status).toBe(EChainTxStatus.Confirmed);
    expect(result).toBeUndefined();
    expect(fatl).toBeDefined();
    expect(Number(fatl?.change)).toBe(1);
    expect(fatl?.type).toBe(TransactionLogType.CreditPurchase);
  });

  it("should create update tx status (with credit pack) to confirmed", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });

    await updateTxStatusToConfirmed(
      CREDIT_CONFIRM_SIGNATURE_2,
      100,
      creditPack.id,
    );

    const fatl = await prisma.fungibleAssetTransactionLog.findFirst({
      where: { chainTxHash: CREDIT_CONFIRM_SIGNATURE_2 },
    });

    expect(fatl).toBeDefined();
    expect(Number(fatl?.change)).toBe(100);
  });

  it("should return error if Payload is not defined", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue(null);
    const result = await updateTxStatusToConfirmed(CREDIT_CONFIRM_SIGNATURE, 3);

    expect(result).toEqual({
      error: "User not authenticated",
    });
  });
});
