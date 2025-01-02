import prisma from "@/app/services/prisma";
import { QuestionType, Token } from "@prisma/client";
import { format } from "date-fns";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  console.log("apiKey", apiKey);
  console.log("process.env.BOT_API_KEY", process.env.BOT_API_KEY);
  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await request.json();
  const type = QuestionType.BinaryQuestion;
  const { question } = data;
  console.log("data", data);

  if (!question) {
    return Response.json("Question text is required", {
      status: 400,
    });
  }

  try {
    const currentDate = new Date();
    const tag = format(currentDate, "MM/dd/yyyy");

    const deck = await prisma.deck.create({
      data: {
        deck: `CHOMPY: ${tag}`,
        revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        activeFromDate: new Date(),
        deckQuestions: {
          create: {
            question: {
              create: {
                question,
                type,
                revealToken: Token.Bonk,
                revealTokenAmount: 10,
                revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                durationMiliseconds: BigInt(60000),
                questionOptions: {
                  create: [
                    {
                      option: "A",
                      isCorrect: true,
                      isLeft: true,
                    },
                    {
                      option: "B",
                      isCorrect: false,
                      isLeft: false,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      deckLink: "/application/decks/" + deck.id,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return new Response(`Error creating question`, {
      status: 500,
    });
  }
}
