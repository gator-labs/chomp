"use server";

import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export const getKey = async (): Promise<{ error?: unknown; key?: Secret }> => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.DYNAMIC_BEARER_TOKEN}`,
    },
  };

  try {
    const response = await fetch(
      `https://app.dynamicauth.com/api/v0/environments/${process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/keys`,
      options
    );
    const responseJson = await response.json();
    const publicKey = responseJson.key.publicKey;
    return { key: Buffer.from(publicKey, "base64").toString("ascii") };
  } catch (ex: unknown) {
    console.error(ex);
    return { error: ex };
  }
};

export const decodeJwtPayload = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const key = await getKey();
    if (key.error || !key.key) {
      return null;
    }

    const result = jwt.verify(token, key.key, {
      algorithms: ["RS256"],
    });

    if (typeof result === "object" && result !== null) {
      return result as JwtPayload;
    }

    return null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
