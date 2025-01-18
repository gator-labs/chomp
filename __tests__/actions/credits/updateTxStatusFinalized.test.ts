import { updateTxStatusToFinalized } from "@/actions/credits/updateTxStatusFinalized";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { ChainTxStatusUpdateError } from "@/lib/error";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import {
  EChainTxStatus,
  EChainTxType, //   FungibleAsset,
  TransactionLogType,
} from "@prisma/client";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("updateTxStatusToFinalized", () => {
  const CREDIT_FINAL_SIGNATURE = "CREDIT_FINAL_SIGNATURE_" + "X".repeat(64);
  let user: { id: string; wallet: string };

  beforeAll(async () => {
    const users = await generateUsers(1);
    user = {
      id: users[0].id,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 44 } }),
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
        hash: CREDIT_FINAL_SIGNATURE,
        status: EChainTxStatus.Confirmed,
        solAmount: "0.002",
        wallet: user.wallet,
        feeSolAmount: "0",
        recipientAddress: faker.string.hexadecimal({
          length: { min: 32, max: 44 },
        }),
        type: EChainTxType.CreditPurchase,
      },
    });
  });

  afterAll(async () => {
    // Clean up all created records
    await prisma.fungibleAssetTransactionLog.deleteMany({
      where: { chainTxHash: CREDIT_FINAL_SIGNATURE },
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

  it("should create update tx status to finalized and create transaction log", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });

    const result = await updateTxStatusToFinalized(
      CREDIT_FINAL_SIGNATURE,
      2,
      0.0005,
    );

    const chainTx = await prisma.chainTx.findFirst({
      where: { hash: CREDIT_FINAL_SIGNATURE },
    });

    const fatl = await prisma.fungibleAssetTransactionLog.findFirst({
      where: { chainTxHash: CREDIT_FINAL_SIGNATURE },
    });

    expect(chainTx).toBeDefined();
    expect(chainTx?.status).toBe(EChainTxStatus.Finalized);
    expect(result).toBeUndefined();
    expect(fatl).toBeDefined();
    expect(Number(fatl?.change)).toBe(2);
    expect(fatl?.type).toBe(TransactionLogType.CreditPurchase);
  });

  it("should throw Error if same hash is already exist in FATL", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });

    try {
      await updateTxStatusToFinalized(CREDIT_FINAL_SIGNATURE, 2, 0.0005);
    } catch (error) {
      expect(error).toBeInstanceOf(ChainTxStatusUpdateError);
    }
  });

  it("should return error if Payload is not defined", async () => {
    (getJwtPayload as jest.Mock).mockReturnValue(null);
    const result = await updateTxStatusToFinalized(
      CREDIT_FINAL_SIGNATURE,
      2,
      0.0005,
    );

    expect(result).toEqual({
      error: "User not authenticated",
    });
  });
});
