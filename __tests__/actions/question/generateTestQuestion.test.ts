import {
  generateBinaryTestQuestion,
  generateMultipleChoiceTestQuestion,
} from "@/app/actions/question/generateTestQuestion";
import { getIsUserAdmin } from "@/app/queries/user";
import prisma from "@/app/services/prisma";

jest.mock("@/app/queries/user", () => ({
  getIsUserAdmin: jest.fn(),
}));

const deleteQuestions = async (deckId: number) => {
  const users = await prisma.questionAnswer.findMany({
    distinct: ["userId"],
    select: {
      userId: true,
    },
    where: {
      questionOption: {
        question: {
          deckQuestions: {
            some: {
              deckId,
            },
          },
        },
      },
    },
  });
  const questions = await prisma.question.findMany({
    where: { deckQuestions: { some: { deckId } } },
  });
  const questionIds = questions.map((q) => q.id);
  await prisma.questionAnswer.deleteMany({
    where: { questionOption: { question: { id: { in: questionIds } } } },
  });
  await prisma.questionOption.deleteMany({
    where: { question: { id: { in: questionIds } } },
  });
  await prisma.deckQuestion.deleteMany({
    where: { deckId },
  });
  await prisma.question.deleteMany({
    where: { id: { in: questionIds } },
  });
  await prisma.deck.deleteMany({ where: { id: deckId } });

  await prisma.user.deleteMany({
    where: {
      id: { in: users.map((user) => user.userId) },
    },
  });
};

describe("Add to community ask list", () => {
  let deckId: number;
  let deckId2: number;

  beforeAll(async () => {
    (getIsUserAdmin as jest.Mock).mockResolvedValue(true);
  });

  afterAll(async () => {
    if (deckId) await deleteQuestions(deckId);
    if (deckId2) await deleteQuestions(deckId2);
  });

  it("should test generateBinaryTestQuestion", async () => {
    const userCount = 50;
    const questionCount = 5;

    const res = await generateBinaryTestQuestion("A", "test", 1, questionCount);

    deckId = res.deckId;

    const selectedCounts = await prisma.questionAnswer.groupBy({
      _count: {
        _all: true,
      },
      by: ["userId"],
      where: {
        questionOption: {
          question: {
            deckQuestions: {
              some: {
                deckId,
              },
            },
          },
        },
        selected: true,
      },
    });

    const percentageCounts = await prisma.questionAnswer.groupBy({
      _count: {
        _all: true,
      },
      by: ["userId"],
      where: {
        questionOption: {
          question: {
            deckQuestions: {
              some: {
                deckId,
              },
            },
          },
        },
        percentage: {
          not: null,
        },
      },
    });

    expect(selectedCounts.length).toBe(userCount);
    expect(percentageCounts.length).toBe(userCount);

    // There should be questionCount selected answers per user
    for (let i = 0; i < selectedCounts.length; i++) {
      expect(selectedCounts[i]._count._all).toBe(questionCount);
      expect(percentageCounts[i]._count._all).toBe(questionCount);
    }
  });

  it("should test generateMultipleChoiceTestQuestion", async () => {
    const userCount = 50;
    const questionCount = 5;

    const res = await generateMultipleChoiceTestQuestion(
      "A",
      "test",
      1,
      questionCount,
    );

    deckId2 = res.deckId;

    const selectedCounts = await prisma.questionAnswer.groupBy({
      _count: {
        _all: true,
      },
      by: ["userId"],
      where: {
        questionOption: {
          question: {
            deckQuestions: {
              some: {
                deckId,
              },
            },
          },
        },
        selected: true,
      },
    });

    const percentageCounts = await prisma.questionAnswer.groupBy({
      _count: {
        _all: true,
      },
      by: ["userId"],
      where: {
        questionOption: {
          question: {
            deckQuestions: {
              some: {
                deckId,
              },
            },
          },
        },
        percentage: {
          not: null,
        },
      },
    });

    expect(selectedCounts.length).toBe(userCount);
    expect(percentageCounts.length).toBe(userCount);

    // There should be questionCount selected answers per user
    for (let i = 0; i < selectedCounts.length; i++) {
      expect(selectedCounts[i]._count._all).toBe(questionCount);
      expect(percentageCounts[i]._count._all).toBe(questionCount);
    }
  });
});
