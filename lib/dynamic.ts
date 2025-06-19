type DynamicUserResult = {
  id: string;
  wallets: {
    id: string;
    userId: string;
    publicKey: string;
    chain: string;
  }[];
};

export const revokeDynamicSession = async (userId: string) => {
  const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;

  const response = await fetch(
    `https://app.dynamicauth.com/api/v0/users/${userId}/sessions/revoke`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dynamicBearer}`,
      },
    },
  );

  if (response?.status > 299)
    throw new Error(`Dynamic revoke call: status code: ${response.status}`);
};

export const createDynamicUser = async (wallet: string): Promise<string> => {
  const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;
  const dynamicEnv = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  const response = await fetch(
    `https://app.dynamicauth.com/api/v0/environments/${dynamicEnv}/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dynamicBearer}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: {
          address: wallet,
          type: "solana",
        },
        environmentId: dynamicEnv,
      }),
    },
  );

  if (!response.ok)
    throw new Error(
      `Dynamic create user call: status code: ${response.status}`,
    );

  try {
    const data = await response.json();

    if (!data?.user?.id)
      throw new Error(`Dynamic create user call: no user returned`);

    return data.user.id;
  } catch {
    throw new Error("Failed to create Dynamic user");
  }
};

/**
 * Batch user creation.
 *
 * @param wallets - Array of all wallets to create.
 *
 * @return walletMap - Mapping of wallet -> userId (if successful), or
 *                     wallet -> null in the case of failure.
 */
export const createDynamicUsers = async (
  wallets: string[],
): Promise<Record<string, string | null>> => {
  const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;
  const dynamicEnv = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  const response = await fetch(
    `https://app.dynamicauth.com/api/v0/environments/${dynamicEnv}/users/bulk`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dynamicBearer}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        wallets.map((address) => ({
          wallets: [
            {
              walletName: "API Wallet",
              publicWalletAddress: address,
              chain: "SOL",
              walletProvider: "browserExtension",
            },
          ],
        })),
      ),
    },
  );

  if (!response.ok)
    throw new Error(
      `Dynamic create user call: status code: ${response.status}`,
    );

  try {
    const data = await response.json();

    return (data.created ?? []).flatMap((user: DynamicUserResult) =>
      user.wallets.map((wallet) => ({
        address: wallet.publicKey,
        userId: wallet.userId,
      })),
    );
  } catch {
    throw new Error("Failed to create Dynamic user");
  }
};
