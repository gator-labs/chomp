"use server";

import { extractId } from "../utils/telegramId";

export const getUserId = async (telegramId: string) => {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/validate`, options);
    const telegramRawData = await response.json();
    const telegramId = extractId(telegramRawData.message);
    return telegramId;
  } catch (err) {
    console.error(err);
    return null;
  }
};
