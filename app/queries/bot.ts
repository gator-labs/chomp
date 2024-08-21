"use server";
import { decodeJwtPayload } from "@/lib/auth";
import { IChompUser } from "../interfaces/user";
import { getUserByEmail } from "./user";

export const getRevealQuestionsData = async (authToken: string) => {
  try {
    const decodedData = await decodeJwtPayload(authToken);
    if (!decodedData?.email) {
      throw new Error("Failed to decode JWT or email is missing.");
    }

    const userEmail = decodedData.email;
    const userData = await getUserByEmail(userEmail);
    if (!userData?.id) {
      throw new Error("User data not found or user ID is missing.");
    }

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BOT_API_KEY!,
      },
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/question/reveal?userId=${userData.id}`,
      options,
    );

    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

export const processBurnAndClaim = async (
  authToken: string,
  signature: string,
  questionIds: number[],
) => {
  const body = JSON.stringify({
    questionIds: questionIds,
    burnTx: signature,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
    body: body,
  };

  try {
    // Decode the JWT payload
    const decodedData = await decodeJwtPayload(authToken);
    if (!decodedData?.email) {
      throw new Error("Failed to decode JWT or email is missing.");
    }

    // Fetch user data by email
    const userEmail = decodedData.email;
    const userData = await getUserByEmail(userEmail);
    if (!userData?.id) {
      throw new Error("User data not found or user ID is missing.");
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/question/reveal?userId=${userData.id}`,
      options,
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    return null;
  }
};

// With dynamic payload
export const handleCreateUser = async (
  id: string,
  tgId: string,
  authToken: string,
): Promise<IChompUser | null> => {
  const decodedData = await decodeJwtPayload(authToken);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
    body: JSON.stringify({
      existingId: id,
      telegramId: tgId,
      newId: decodedData?.sub,
      email: decodedData?.email,
      address: decodedData?.verified_credentials[0]?.address,
    }),
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user`,
      options,
    );
    const user = await response.json();
    return user;
  } catch {
    return null;
  }
};

// get user with verified telegram data
export const getVerifiedUser = async (
  initData: any,
): Promise<IChompUser | null> => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
    body: JSON.stringify({ initData }),
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate`,
      options,
    );
    const telegramRawData = await response.json();
    const user = telegramRawData.profile;
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// does user already have an account in pwa
export const isUserExistByEmail = async (
  email: string,
): Promise<boolean | null> => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user?email=${email}`,
      options,
    );
    const isChompAppUser = await response.json();
    return isChompAppUser?.isChompAppUser;
  } catch {
    return null;
  }
};
