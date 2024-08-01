"use server";

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
