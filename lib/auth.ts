"use server";

import jwt, { JwtPayload, Secret, VerifyErrors } from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/app/services/prisma";

interface DynamicJwtPayload {
  sub: string;
  exp: number;
  verified_credentials: {
    address: string;
    chain: string;
  }[];
}

export const getKey = (
  _headers: unknown,
  callback: (err: Error | null, key?: Secret) => void
): void => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.DYNAMIC_BEARER_TOKEN}`,
    },
  };

  fetch(
    `https://app.dynamicauth.com/api/v0/environments/${process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/keys`,
    options
  )
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const publicKey = json.key.publicKey;
      const pemPublicKey = Buffer.from(publicKey, "base64").toString("ascii");
      callback(null, pemPublicKey);
    })
    .catch((err) => {
      console.error(err);
      callback(err);
    });
};

export const decodeJwtPayload = async (
  token: string
): Promise<DynamicJwtPayload | null> => {
  try {
    const decodedToken = await new Promise<DynamicJwtPayload | null>(
      (resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          { algorithms: ["RS256"] },
          (
            err: VerifyErrors | null,
            decoded: string | JwtPayload | undefined
          ) => {
            if (err) {
              reject(err);
            } else {
              if (typeof decoded === "object" && decoded !== null) {
                resolve(decoded as DynamicJwtPayload);
              } else {
                reject(new Error("Invalid token"));
              }
            }
          }
        );
      }
    );
    return decodedToken;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const getJwtPayload = async () => {
  const token = cookies().get("token");

  if (!token) {
    return null;
  }

  return await decodeJwtPayload(token.value);
};

export const setJwt = async (token: string) => {
  if (!token) {
    clearJwt();
    return;
  }

  const payload = await decodeJwtPayload(token);

  if (!payload || !payload.sub) {
    clearJwt();
    return;
  }

  const user = await prisma.user.upsert({
    where: {
      id: payload.sub,
    },
    create: {
      id: payload.sub,
    },
    update: {},
    include: {
      wallets: true,
    },
  });

  const walletAddresses = payload.verified_credentials
    .filter((vc) => vc.address && vc.chain === "solana")
    .map((vc) => vc.address as string);

  const userWalletAddresses = user.wallets.map((wallet) => wallet.address);

  const walletsToCreate = walletAddresses.filter(
    (address) => !userWalletAddresses.includes(address)
  );

  if (walletsToCreate.length > 0) {
    await prisma.wallet.createMany({
      data: walletsToCreate.map((address) => ({
        address,
        userId: user.id,
      })),
    });
  }

  const walletsToDelete = userWalletAddresses.filter(
    (address) => !walletAddresses.includes(address)
  );

  if (walletsToDelete.length > 0) {
    await prisma.wallet.deleteMany({
      where: {
        address: {
          in: walletsToDelete,
        },
      },
    });
  }

  cookies().set("token", token, {
    expires: payload.exp * 1000,
    secure: true,
    httpOnly: true,
  });
};

export const clearJwt = () => {
  cookies().set("token", "", { expires: new Date(0) });
};
