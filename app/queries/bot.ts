"use server";

import { IChompUser } from "../interfaces/user";
import { extractId } from "../utils/telegramId";

export const getUserData = async (telegramId: string) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/telegram?telegramId=${telegramId}`,
      options,
    );
    const data = await response.json();
    return data.profile;
  } catch (error) {
    return null;
  }
};

export const getRevealQuestionsData = async (userId: string) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/question/reveal?userId=${userId}`,
      options,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

export const verifyPayload = async (initData: any) => {
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
    const telegramId = extractId(telegramRawData.message);
    const user = await getUserData(telegramId);
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getProfileByEmail = async (email: string) => {
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
    const user = await response.json();
    return user;
  } catch {
    return null;
  }
};

export const handleCreateUser = async (
  id: string,
  newId: string,
  tgId: string,
  address: string,
  email: string,
): Promise<IChompUser | null> => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BOT_API_KEY!,
    },
    body: JSON.stringify({
      existingId: id,
      newId,
      telegramId: tgId,
      email,
      address,
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
