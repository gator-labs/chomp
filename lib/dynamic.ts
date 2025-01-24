export const revokeDynamicSession = async (userId: string) => {
  const dynamicBearer = process.env.DYNAMIC_BEARER_TOKEN;

  await fetch(
    `https://dynamicauth.com/api/v0/users/${userId}/sessions/revoke`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dynamicBearer}`,
      },
    },
  );
};
