import { verifyPayment } from "@/actions/credits/verifyPayment";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
import { generateUsers } from "@/scripts/utils";
import { EChainTxType } from "@prisma/client";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

jest.mock("@/app/utils/getSolPaymentAddress", () => ({
  getSolPaymentAddress: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("Verify SOL payment transaction", () => {
  let users: { id: string; username: string }[] = [];

  const TX_ORIGIN = "9tA2k463vH6pP8M4GwBi5eCzwoGLqTEc98Za6BgzwgYr";
  const TX_HASH =
    "2bq6miRdKZDXY9DXcqavJ8YBHWWsNgG5Hdbunnn7h6CZ2LKCBubcaz31YBX6HgWu8fVmZjpj3KRxs3wbjHDy99tW";
  const TREASURY_PUBLIC_KEY = "EfkfxnFXsTj23TpsuZ37V7LVb5H663mVp6cSPqMeDVUW";

  beforeAll(async () => {
    users = await generateUsers(1);

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.upsert({
      where: { address: TX_ORIGIN },
      update: { userId: users[0].id },
      create: {
        address: TX_ORIGIN,
        userId: users[0].id,
      },
    });

    await prisma.chainTx.create({
      data: {
        hash: TX_HASH,
        wallet: TX_ORIGIN,
        type: EChainTxType.CreditPurchase,
        solAmount: "4",
        feeSolAmount: "0",
        recipientAddress: TREASURY_PUBLIC_KEY,
      },
    });

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: users[0].id });
    (getSolPaymentAddress as jest.Mock).mockResolvedValue(TREASURY_PUBLIC_KEY);
  });

  afterAll(async () => {
    await prisma.chainTx.deleteMany({
      where: { hash: TX_HASH },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: users[0].id,
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: { in: users.map((user) => user.id) },
      },
    });
  });

  it("Should verify valid transfer", async () => {
    const isValid = await verifyPayment(TX_HASH);

    expect(isValid).toBeTruthy();
  });
});
