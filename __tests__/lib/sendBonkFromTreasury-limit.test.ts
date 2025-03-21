import { sendBonk } from "@/app/utils/sendBonk";
import { getBonkOneTimeLimit } from "@/lib/env-vars";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import { faker } from "@faker-js/faker";
import { EChainTxType } from "@prisma/client";

jest.mock("p-retry", () => ({
  retry: jest.fn((fn) => fn()),
}));

jest.mock("@/app/utils/sendBonk", () => ({
  ...jest.requireActual("@/app/utils/sendBonk"),
  sendBonk: jest.fn(async () => faker.string.hexadecimal({ length: 86 })),
}));

jest.mock("@/lib/env-vars", () => ({
  ...jest.requireActual("@/lib/env-vars"),
  getBonkOneTimeLimit: jest.fn(() => 5000),
}));

describe("sendBonkFromTreasury limit", () => {
  it("should refuse to send bonk above one-time limit", async () => {
    expect(jest.isMockFunction(getBonkOneTimeLimit)).toBeTruthy();
    expect(jest.isMockFunction(sendBonk)).toBeTruthy();

    const sendTx = await sendBonkFromTreasury(
      10_000,
      "2R4FJYwB5TyJrLHbE9Gv4unRggCXwKpFGpB2dUJP15Yb",
      EChainTxType.MysteryBoxClaim,
    );

    // Ideally we'd be able to identify the actual
    // reason for rejection, but currently we only
    // emit a log to Sentry.
    expect(sendTx).toBe(null);

    expect(sendBonk).not.toHaveBeenCalled();
  });
});
