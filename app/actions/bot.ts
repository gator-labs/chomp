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

export const getQuestionsReadyToReveal = async (userId: string) => {
  try {
    const response = await fetch(`/api/question/reveal/?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.NEXT_PUBLIC_BOT_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
  } catch (error: any) {
    console.error("Error fetching questions:", error);
  }
};

export const processBurnAndClaim = async (
  userId: string,
  signature: string,
) => {
  try {
    fetch(`/api/question/reveal/?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": `test`,
      },
      body: JSON.stringify({
        questionIds: [1, 3],
        burnTx: signature,
      }),
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
  }
};
