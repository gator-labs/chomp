import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";

describe("Answers", () => {
  let deckId: number;
  let questionIds: number[] = [];
  let otherUsers: { id: string; username: string }[] = [];
  let existingQuestionIds = {};

  beforeAll(async () => {
    const futureDate = dayjs().add(1, "day").toDate();
    const pastDate = dayjs().subtract(1, "day").toDate();

    const existingQuestions = await prisma.question.findMany({
      select: {
        id: true,
      },
    });

    existingQuestionIds = Object.fromEntries(
      existingQuestions.map((question) => [question.id, true]),
    );

    await prisma.$transaction(async (tx) => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          deck: "Deck 1",
          date: new Date(),
          revealAtDate: futureDate,
        },
      });

      deckId = deck.id;

      // Create questions for decks
      const questions = await Promise.all([
        // Past question (ready to reveal), already have an answer
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: pastDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 90,
                    calculatedAveragePercentage: 70,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 10,
                    calculatedAveragePercentage: 30,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        // Past question (ready to reveal), no answer
        tx.question.create({
          data: {
            question: "Is water wet?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: pastDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                  },
                  {
                    option: "No",
                    isLeft: false,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        // Question that is not ready to reveal
        tx.question.create({
          data: {
            question: "Is water wet?",
            type: QuestionType.BinaryQuestion,
            revealAtDate: futureDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                  },
                  {
                    option: "No",
                    isLeft: false,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
      ]);

      questionIds = questions.map((q) => q.id);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
        ],
      });

      const minAnswersPerQuestion = Number(
        process.env.MINIMAL_ANSWERS_PER_QUESTION ?? 0,
      );

      if (minAnswersPerQuestion > 0) {
        otherUsers = await generateUsers(minAnswersPerQuestion);

        await tx.user.createMany({
          data: otherUsers,
        });

        for (let userIdx = 0; userIdx < minAnswersPerQuestion; userIdx++) {
          await tx.questionAnswer.createMany({
            data: questions.flatMap((question) =>
              question.questionOptions.map((qo, i) => ({
                questionOptionId: qo.id,
                userId: otherUsers[userIdx].id,
                selected: i === 0,
              })),
            ),
          });
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.deleteMany({
        where: { userId: { in: otherUsers.map((user) => user.id) } },
      });
      await tx.questionOption.deleteMany({
        where: { questionId: { in: questionIds } },
      });
      await tx.deckQuestion.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
      await tx.deck.deleteMany({ where: { id: { equals: deckId } } });

      if (otherUsers.length > 0) {
        await tx.user.deleteMany({
          where: { id: { in: otherUsers.map((user) => user.id) } },
        });
      }
    });
  });
});
