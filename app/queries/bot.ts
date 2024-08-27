"use server";
import { decodeJwtPayload, DynamicJwtPayload } from "@/lib/auth";

import { IClaimedQuestion } from "../interfaces/question";
import { IChompUser } from "../interfaces/user";
import prisma from "../services/prisma";
import { claimAllSelected, revealAllSelected } from "./processBurnClaim";
import {
  getUserByEmail,
  getUserByTelegram,
  setEmail,
  setWallet,
  updateUser,
} from "./user";
import { validateTelegramData } from "./validateTelegramData";

// THIS API RETURNS THE QUESTION WHICH ARE READY TO REVEAL.
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

// PROCESS THE BURN AND CLAIM OF SELECTED QUESTIONS
export const processBurnAndClaim = async (
  authToken: string,
  signature: string,
  questionIds: number[],
): Promise<IClaimedQuestion[] | null> => {
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

    const userId = userData.id;

    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userWallet) {
      throw new Error("No wallet found for the user");
    }

    await revealAllSelected(questionIds, userId, signature);
    const results = await claimAllSelected(
      questionIds,
      userId,
      userWallet?.address,
    );
    if (!results?.chompResults) {
      return null;
    }
    return results?.chompResults;
  } catch (error: any) {
    return null;
  }
};

// UPDATES USER PROFILE BY EMAIL INCLUDING STORING NEW WALLET AND EMAIL
export const handleCreateUser = async (
  authToken: string,
  initData: string,
): Promise<IChompUser | null> => {
  const decodedData = await decodeJwtPayload(authToken);
  const validatedInitData = await validateTelegramData(initData);
  const { email, sub, verified_credentials } = decodedData as DynamicJwtPayload;
  const address = verified_credentials[0]?.address || "";

  const tempUserDetails = await getUserByTelegram(
    String(validatedInitData?.id),
  );

  const temUserId = tempUserDetails?.id;

  if (!(email && sub && address && temUserId)) {
    throw new Error("Failed to create user");
  }

  try {
    await updateUser(
      {
        id: sub,
        telegramId: String(validatedInitData?.id),
      },
      temUserId,
    );

    await setWallet({
      userId: sub,
      address,
    });

    await setEmail({
      userId: sub,
      address: email,
    });

    const profile = await getUserByEmail(email);
    return profile;
  } catch {
    return null;
  }
};

/*
  IT VALIDATES THE TELEGRAM PAYLOAD AND RETURNS USER DATA
*/
export const getVerifiedUser = async (
  initData: string,
): Promise<IChompUser | null> => {
  try {
    const telegramId = validateTelegramData(initData);
    const profile = await getUserByTelegram(String(telegramId?.id));
    if (!profile) {
      throw new Error("No profile found");
    } else {
      return profile;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

// GET METHOD: FETCHES USER PROFILE BY EMAIL (Add telegram payload)
export const doesUserExistByEmail = async (
  email: string,
): Promise<boolean | null> => {
  try {
    if (!email || Array.isArray(email)) {
      throw new Error("Email parameter is required");
    }

    const profile = await getUserByEmail(email);

    if (!profile) {
      throw new Error("No data found");
    }

    const isChompAppUser = !!(
      profile &&
      !profile.telegramId &&
      profile.emails[0]?.address &&
      profile.wallets[0]?.address
    );

    return isChompAppUser;
  } catch {
    return null;
  }
};
