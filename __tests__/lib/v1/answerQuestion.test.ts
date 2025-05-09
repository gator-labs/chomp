import prisma from "@/app/services/prisma";
import { answerQuestion } from "@/lib/v1/answerQuestion";
import { QuestionType, Token } from "@prisma/client";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

describe("answerQuestion", () => {
  const user1 = {
    id: uuidv4(),
    username: `user1`,
  };

  const futureDate = dayjs().add(30, "day").toDate();
  const pastDate = dayjs().subtract(30, "day").toDate();

  let deckId: number;
  let questionIds: number[] = [];
  let questionUuids: string[] = [];
  let question0OptionUuids: string[] = [];

  beforeAll(async () => {
    await prisma.$transaction(async (tx) => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          deck: "Deck 1",
          date: new Date(),
          revealAtDate: futureDate,
          creditCostPerQuestion: 2,
        },
      });

      deckId = deck.id;

      // Create users
      await Promise.all([tx.user.create({ data: user1 })]);

      // Create questions for decks
      const questions = await Promise.all([
        tx.question.create({
          data: {
            question: "Is the sky blue?",
            source: "mustard",
            type: QuestionType.BinaryQuestion,
            activeFromDate: futureDate,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 90,
                    calculatedAveragePercentage: 70,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 10,
                    calculatedAveragePercentage: 30,
                    index: 1,
                  },
                ],
              },
            },
          },
          include: {
            questionOptions: true,
          },
        }),
        tx.question.create({
          data: {
            question: "Is water wet?",
            activeFromDate: pastDate,
            source: "mustard",
            type: QuestionType.BinaryQuestion,
            revealToken: Token.Bonk,
            revealTokenAmount: 5000,
            creditCostPerQuestion: 2,
            questionOptions: {
              createMany: {
                data: [
                  {
                    option: "Yes",
                    isLeft: true,
                    calculatedIsCorrect: true,
                    calculatedPercentageOfSelectedAnswers: 85,
                    calculatedAveragePercentage: 60,
                    index: 0,
                  },
                  {
                    option: "No",
                    isLeft: false,
                    calculatedIsCorrect: false,
                    calculatedPercentageOfSelectedAnswers: 15,
                    calculatedAveragePercentage: 40,
                    index: 1,
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
      questionUuids = questions.map((q) => q.uuid);

      question0OptionUuids = questions[0].questionOptions.map((qo) => qo.uuid);

      await tx.deckQuestion.createMany({
        data: [
          { deckId: deckId, questionId: questions[0].id },
          { deckId: deckId, questionId: questions[1].id },
        ],
      });
    });
  });

  afterAll(async () => {
    // Clean up the data after the test
    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: { userId: { equals: user1.id } },
      });
      await tx.questionAnswer.deleteMany({
        where: { userId: { equals: user1.id } },
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
      await tx.user.deleteMany({ where: { id: { equals: user1.id } } });
    });
  });

  it("should not answer question from another source", async () => {
    await expect(
      answerQuestion(
        user1.id,
        questionUuids[0],
        "ketchup",
        question0OptionUuids[0],
        question0OptionUuids[0],
        55,
      ),
    ).rejects.toThrowError("Question not found or not answerable");
  });

  it("should not answer question with future activeFromDate", async () => {
    await expect(
      answerQuestion(
        user1.id,
        questionUuids[0],
        "mustard",
        question0OptionUuids[0],
        question0OptionUuids[0],
        55,
      ),
    ).rejects.toThrowError("Question is not answerable yet");
  });

  it("should not answer invalid question", async () => {
    await expect(
      answerQuestion(
        user1.id,
        "00000000-0000-0000-0000-000000000000",
        "mustard",
        question0OptionUuids[0],
        question0OptionUuids[0],
        55,
      ),
    ).rejects.toThrowError("Question not found or not answerable");
  });

  it("should answer a question successfully", async () => {
    await prisma.question.update({
      data: {
        activeFromDate: pastDate,
      },
      where: {
        id: questionIds[0],
      },
    });

    const answerUuid = await answerQuestion(
      user1.id,
      questionUuids[0],
      "mustard",
      question0OptionUuids[0],
      question0OptionUuids[0],
      55,
    );

    expect(answerUuid).toBeDefined();

    const qans = await prisma.questionAnswer.findMany({
      where: {
        uuid: answerUuid,
        questionOption: {
          question: {
            id: questionIds[0],
          },
        },
      },
      include: {
        questionOption: true,
      },
    });

    expect(qans.length).toBe(2);

    for (let i = 0; i < qans.length; i++) {
      if (qans[i].questionOption.uuid === question0OptionUuids[0])
        expect(qans[i].selected).toBeTruthy();
      else expect(qans[i].selected).toBeFalsy();

      if (qans[i].questionOption.uuid === question0OptionUuids[0])
        expect(qans[i].percentage).toBe(55);
      else expect(qans[i].percentage).toBeNull();
    }
  });

  it("should not answer a question a second time", async () => {
    await prisma.question.update({
      data: {
        activeFromDate: pastDate,
      },
      where: {
        id: questionIds[0],
      },
    });
    await expect(
      answerQuestion(
        user1.id,
        questionUuids[0],
        "mustard",
        question0OptionUuids[0],
        question0OptionUuids[0],
        55,
      ),
    ).rejects.toThrowError(
      "User already submitted an answer for this question",
    );
  });
});
