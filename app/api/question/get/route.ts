import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import prisma from "@/app/services/prisma";
import dayjs from "dayjs";
import { getRandomElement } from "@/app/utils/randomUtils";

const questionDeckToRunInclude = {
  deckQuestions: {
    include: {
      question: {
        include: {
          questionOptions: true,
          questionTags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.DeckInclude;

export async function GET(req: Request) {

  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId|| Array.isArray(userId)) {
    return Response.json("userId parameter is required", { status: 400 });
  }

  const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  const currentDayEnd = dayjs(new Date()).endOf("day").toDate();
  
  const dailyDeck = await prisma.deck.findFirst({
    where: {
      date: { gte: currentDayStart, lte: currentDayEnd },
      isActive: true,
      deckQuestions: {
        every: {
          question: {
            revealAtDate: {
              gte: new Date(),
            },
          },
        },
      },
      userDeck: { none: { userId: userId } }
    },
    include: questionDeckToRunInclude,
  });

  const getDailyDeckQuestions = dailyDeck?.deckQuestions.map((dq) => ({
  id: dq.questionId,
  durationMiliseconds: Number(dq.question.durationMiliseconds),
  question: dq.question.question,
  type: dq.question.type,
  imageUrl: dq.question.imageUrl ?? undefined,
  questionOptions: dq.question.questionOptions.map((qo) => ({
    id: qo.id,
    option: qo.option,
    isLeft: qo.isLeft,
  })),
  deckId: dq.deckId,
  questionTags: dq.question.questionTags,
  deckRevealAtDate: dailyDeck.revealAtDate,
}));

// Daily Deck
if (getDailyDeckQuestions && getDailyDeckQuestions.length > 0){
  return Response.json({ question: getRandomElement(getDailyDeckQuestions) });
}else{ // Unanwsered Questions
  const dailyDeckQuestions = await prisma.deckQuestion.findMany({
    where: {
      deck: {
        date: {
          gte: dayjs(new Date()).add(-3, "days").toDate(),
          lte: dayjs(new Date()).endOf("day").toDate(),
        },
        revealAtDate: { gte: new Date() },
      },
      question: {
        question: { contains: "", mode: "insensitive" },
        questionOptions: {
          none: {
            questionAnswers: {
              some: {
                userId: userId
              },
            },
          },
        },
        OR: [{ revealAtDate: { gte: new Date() } }, { revealAtDate: null }],
      },
    },
    include: {
      question: {
        include: {
          questionOptions: true,
          questionTags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
    orderBy: {
      deck: { date: "desc" },
    },
  });

  const questions = dailyDeckQuestions.map((dq) => dq.question);

  if (questions.length === 0)
    new Response(`No questions found to load`, {
      status: 400,
    });

  return Response.json({ question: getRandomElement(questions) });
}
}
