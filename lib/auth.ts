import jwt, { JwtPayload, Secret, VerifyErrors } from "jsonwebtoken";

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

export const validateJWT = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const decodedToken = await new Promise<JwtPayload | null>(
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
                resolve(decoded);
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
