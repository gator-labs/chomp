import { verifyPayment } from "@/actions/credits/verifyPayment";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { EChainTxType } from "@prisma/client";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

describe.skip("Verify SOL payment transaction", () => {
  let users: { id: string; username: string }[] = [];

  const TX_ORIGIN = "AfeYagWdonLRMawhVYv9Yv2rb9MJrAnfnT8zfAsgSbLX";
  const TX_HASH =
    "2xhQ4bAq79zv9cUxQ2KWLUGmFimmZBsyAN8Yov88vrnceQYocKKrmjSkigff7bx6SXJBKTNivSooyAkymN1NFXqx";

  // Hardcoded since historical transaction
  const TREASURY_PUBLIC_KEY = "CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9";

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
        solAmount: "0.00001",
        feeSolAmount: "0",
        recipientAddress: TREASURY_PUBLIC_KEY,
      },
    });

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: users[0].id });
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
