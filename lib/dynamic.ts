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
