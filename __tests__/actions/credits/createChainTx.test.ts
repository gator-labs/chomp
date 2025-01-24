import { createSignedSignatureChainTx } from "@/actions/credits/createChainTx";
import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";
import Decimal from "decimal.js";

Decimal.set({ toExpNeg: -128 });

const solPerCreditCost = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT ?? 0;

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("@/actions/getTreasuryAddress", () => ({
  getTreasuryAddress: jest.fn(),
}));

describe("createSignedSignatureChainTx", () => {
  const CREDIT_PURCHASE_SIGNATURE =
    "CREDIT_PURCHASE_SIGNATURE_" + "X".repeat(60);
  let user: { id: string; wallet: string };

  beforeAll(async () => {
    const users = await generateUsers(1);
    user = {
      id: users[0].id,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 44 } }),
    };

    (getJwtPayload as jest.Mock).mockReturnValue({
      sub: user.id,
    });

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
  });

  afterAll(async () => {
    // Clean up all created records
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

  it("should create chain transaction with correct solAmount and wallet", async () => {
    (getTreasuryAddress as jest.Mock).mockResolvedValue(
      faker.string.hexadecimal({ length: { min: 32, max: 44 } }),
    );
    const result = await createSignedSignatureChainTx(
      2,
      CREDIT_PURCHASE_SIGNATURE,
    );

    const chainTx = await prisma.chainTx.findFirst({
      where: { hash: CREDIT_PURCHASE_SIGNATURE },
    });

    const expectedAmount = new Decimal("2").mul(solPerCreditCost).toString();
    console.log(expectedAmount);

    expect(chainTx).toBeDefined();
    expect(chainTx?.solAmount).toBe(expectedAmount);
    expect(chainTx?.wallet).toBe(user.wallet);
    expect(result).toBeUndefined();
  });

  it("should return error if Treasury address is not defined", async () => {
    (getTreasuryAddress as jest.Mock).mockResolvedValue(null);
    const result = await createSignedSignatureChainTx(
      2,
      CREDIT_PURCHASE_SIGNATURE,
    );

    expect(result).toEqual({
      error: "Treasury address is not defined",
    });
  });

  it("should return error if wallet is not found", async () => {
    // Delete wallet
    await prisma.wallet.delete({
      where: { address: user.wallet },
    });

    const result = await createSignedSignatureChainTx(
      2,
      CREDIT_PURCHASE_SIGNATURE,
    );

    expect(result).toEqual({
      error: "Wallet not found, please connect your wallet",
    });

    await prisma.wallet.create({
      data: {
        address: user.wallet,
        userId: user.id,
      },
    });
  });
});
