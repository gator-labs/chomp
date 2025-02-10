import { updateTxStatusToConfirmed } from "@/actions/credits/updateTxStatusConfirm";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
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
  let user: { id: string; wallet: string };

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
  });

  afterAll(async () => {
    // Clean up all created records
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { chainTxHash: CREDIT_CONFIRM_SIGNATURE },
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

    const result = await updateTxStatusToConfirmed(
      CREDIT_CONFIRM_SIGNATURE,
      1,
      2,
    );

    const chainTx = await prisma.chainTx.findFirst({
      where: { hash: CREDIT_CONFIRM_SIGNATURE },
    });

    const fatl = await prisma.fungibleAssetTransactionLog.findFirst({
      where: { chainTxHash: CREDIT_CONFIRM_SIGNATURE },
    });

    expect(chainTx).toBeDefined();
    expect(chainTx?.status).toBe(EChainTxStatus.Confirmed);
    expect(result).toBeUndefined();
    expect(chainTx?.feeSolAmount).toBe("2");
    expect(fatl).toBeDefined();
    expect(Number(fatl?.change)).toBe(1);
    expect(fatl?.type).toBe(TransactionLogType.CreditPurchase);
  });

  it("should return error if Payload is not defined", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue(null);
    const result = await updateTxStatusToConfirmed(
      CREDIT_CONFIRM_SIGNATURE,
      3,
      4,
    );

    expect(result).toEqual({
      error: "User not authenticated",
    });
  });
});
