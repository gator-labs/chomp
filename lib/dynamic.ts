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

export const createDynamicUser = async (wallet: string) => {
  const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;
  const dynamicEnv = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  const response = await fetch(
    `https://app.dynamicauth.com/api/v0/environments/${dynamicEnv}/users`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dynamicBearer}`,
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
