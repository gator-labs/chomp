export const getUserId = async (telegramId: string) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.NEXT_PUBLIC_BOT_API_KEY!,
    },
  };
  try {
    const response = await fetch(
      `/api/user/telegram?telegramId=${telegramId}`,
      options,
    );
    const data = await response.json();
    return data.profile;
  } catch (error) {
    return null;
  }
};

export const getRevealQuestions = async (userId: string) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.NEXT_PUBLIC_BOT_API_KEY!,
    },
  };
  try {
    const response = await fetch(
      `/api/question/reveal?userId=${userId}`,
      options,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};
