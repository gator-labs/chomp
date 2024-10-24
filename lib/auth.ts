import jwt, { Secret } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

export interface VerifiedWallet {
  format: "blockchain";
  address: string;
  chain: string;
}

export interface VerifiedEmail {
  format: "email";
  email: string;
}

export interface DynamicJwtPayload {
  sub: string;
  exp: number;
  verified_credentials: (VerifiedWallet | VerifiedEmail)[];
  new_user: boolean;
}

export const getKey = async (): Promise<{ error?: unknown; key?: Secret }> => {
  try {
    const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/.well-known/jwks`;

    const client = new JwksClient({
      jwksUri: jwksUrl,
      rateLimit: true,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
    });

    const signingKey = await client.getSigningKey();
    const publicKey = signingKey.getPublicKey();
    return { key: publicKey };
  } catch (ex: unknown) {
    console.error(ex);
    return { error: ex };
  }
};

export const decodeJwtPayload = async (
  token: string,
): Promise<DynamicJwtPayload | null> => {
  try {
    if (!token) {
      return null;
    }

    const key = await getKey();
    if (key.error || !key.key) {
      return null;
    }

    const result = jwt.verify(token, key.key, {
      algorithms: ["RS256"],
    });

    if (typeof result === "object" && result !== null) {
      return result as DynamicJwtPayload;
    }

    return null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
