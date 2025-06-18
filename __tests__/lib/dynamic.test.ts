import { createDynamicUsers } from "@/lib/dynamic";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

describe("Create Dynamic users", () => {
  let wallets: string[];

  beforeAll(async () => {
    wallets = Array.from({ length: 10 }, () =>
      faker.string.hexadecimal({ length: { min: 32, max: 42 }, prefix: "" }),
    );
  });

  it("should return created user IDs", async () => {
    global.fetch = jest.fn().mockImplementation(async () => {
      const walletsCopy = wallets.map((wallet) => wallet);
      const users = wallets.map(() => uuidv4());

      const failedWallets = wallets.length > 1 ? [walletsCopy.pop()] : [];

      const created = walletsCopy.map((wallet, i) => ({
        id: users[i],
        projectEnvironmentId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        firstVisit: "2025-06-18T22:08:46.921Z",
        lastVisit: "2025-06-18T22:08:46.921Z",
        email: null,
        tShirtSize: null,
        alias: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        jobTitle: null,
        country: null,
        team: null,
        policiesConsent: null,
        username: null,
        createdAt: "2025-06-18T22:08:46.921Z",
        updatedAt: "2025-06-18T22:08:46.921Z",
        deletedAt: null,
        onboardingCompletedAt: null,
        metadata: {},
        deletedById: null,
        deletedReason: null,
        lowerUsername: null,
        btcWallet: null,
        kdaWallet: null,
        ltcWallet: null,
        ckbWallet: null,
        kasWallet: null,
        dogeWallet: null,
        emailNotification: null,
        discordNotification: null,
        newsletterNotification: null,
        mfaBackupCodeAcknowledgement: null,
        oauthAccounts: [],
        wallets: [
          {
            id: uuidv4(),
            userId: users[i],
            publicKey: wallet,
            chain: "SOL",
            provider: "browserExtension",
            createdAt: "2025-06-18T22:08:46.921Z",
            updatedAt: "2025-06-18T22:08:46.921Z",
            deletedAt: null,
            name: "apiwallet",
            walletBookName: "apiwallet",
            lowerPublicKey: wallet.toLowerCase(),
            signerWalletId: null,
            turnkeyHDWalletId: null,
            signInEnabled: null,
            lastSelectedAt: null,
            projectEnvironmentId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            entryPointVersion: null,
            kernelVersion: null,
            ecdsaProviderType: null,
            deletedUserId: null,
            hardwareWallet: null,
          },
        ],
      }));

      const failed = failedWallets.map((wallet) => ({
        code: "duplicate_exists",
        error:
          "User with project_environment_id, lower_public_key already exists",
        user: {
          wallets: [
            {
              publicWalletAddress: wallet,
              chain: "SOL",
              walletName: "API Wallet",
              walletProvider: "browserExtension",
            },
          ],
        },
      }));

      const result = {
        created,
        failed,
        total: created.length + failed.length,
        updated: [],
      };

      return {
        json: () => Promise.resolve(result),
        ok: true,
      };
    });

    const results = await createDynamicUsers(wallets);

    expect(results.length).toBe(wallets.length - 1);
  });
});
