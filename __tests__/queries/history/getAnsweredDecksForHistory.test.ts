import { getAnsweredDecksForHistory } from "@/app/queries/history";
import prisma from "@/app/services/prisma";
import { generateUsers } from "@/scripts/utils";
import {
  AnswerStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
  QuestionOption,
  QuestionType,
  Token,
} from "@prisma/client";

jest.mock("@/app/utils/auth", () => ({
  authGuard: jest.fn(),
}));

jest.mock("p-retry", () => jest.fn().mockImplementation((fn) => fn()));

describe("getAnsweredDecksForHistory", () => {
  let userId: string;
  let deck1Id: number;
  let deck2Id: number;
  let deck3Id: number;
  let deck4Id: number;
  let question1Id: number;
  let question2Id: number;
  let question3Id: number;
  let question4Id: number;
  let mysteryBoxId: string;
  let questionOptions: QuestionOption[] = [];
  let deckQuestionIds: number[] = [];

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2); // 2 days ago

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2); // 2 days in the future

  beforeAll(async () => {
    const user = await generateUsers(1);
    userId = user[0].id;

    // Create test user
    await prisma.user.create({
      data: {
        id: userId,
      },
    });

    // Create test decks
    const [deck1, deck2, deck3, deck4] = await Promise.all([
      // Deck 1: Revealed (past date), with rewards (credit cost > 0)
      prisma.deck.create({
        data: {
          deck: "Premium Deck",
          revealAtDate: pastDate,
          creditCostPerQuestion: 2,
        },
      }),
      // Deck 2: Revealed (past date), no rewards (credit cost = 0)
      prisma.deck.create({
        data: {
          deck: "Free Deck",
          revealAtDate: pastDate,
          creditCostPerQuestion: 0,
        },
      }),
      // Deck 3: Not revealed (future date), with rewards
      prisma.deck.create({
        data: {
          deck: "Unrevealed Premium Deck",
          revealAtDate: futureDate,
          creditCostPerQuestion: 5,
        },
      }),
      // Deck 4: Revealed (past date), with rewards, but no answered questions
      prisma.deck.create({
        data: {
          deck: "Premium Deck No Answers",
          revealAtDate: pastDate,
          creditCostPerQuestion: 2,
        },
      }),
    ]);

    deck1Id = deck1.id;
    deck2Id = deck2.id;
    deck3Id = deck3.id;
    deck4Id = deck4.id;

    // Create test questions
    const [question1, question2, question3, question4] = await Promise.all([
      // Question 1: For deck 1, with credit cost
      prisma.question.create({
        data: {
          question: "What is the capital of France?",
          type: QuestionType.BinaryQuestion,
          durationMiliseconds: 60000,
          revealToken: Token.Bonk,
          revealTokenAmount: 100,
          creditCostPerQuestion: 2,
          revealAtDate: pastDate,
        },
      }),
      // Question 2: For deck 2, no credit cost
      prisma.question.create({
        data: {
          question: "What is the capital of UK?",
          type: QuestionType.BinaryQuestion,
          durationMiliseconds: 60000,
          revealToken: Token.Bonk,
          revealTokenAmount: 0,
          creditCostPerQuestion: 0,
          revealAtDate: pastDate,
        },
      }),
      // Question 3: For deck 3, with credit cost
      prisma.question.create({
        data: {
          question: "What is the capital of Germany?",
          type: QuestionType.BinaryQuestion,
          durationMiliseconds: 60000,
          revealToken: Token.Bonk,
          revealTokenAmount: 100,
          creditCostPerQuestion: 5,
          revealAtDate: futureDate,
        },
      }),
      // Question 4: For deck 4, with credit cost
      prisma.question.create({
        data: {
          question: "What is the capital of Italy?",
          type: QuestionType.BinaryQuestion,
          durationMiliseconds: 60000,
          revealToken: Token.Bonk,
          revealTokenAmount: 100,
          creditCostPerQuestion: 2,
          revealAtDate: pastDate,
        },
      }),
    ]);

    question1Id = question1.id;
    question2Id = question2.id;
    question3Id = question3.id;
    question4Id = question4.id;

    // Create question options for all questions
    const optionsData = [];
    for (const questionId of [
      question1Id,
      question2Id,
      question3Id,
      question4Id,
    ]) {
      optionsData.push(
        {
          option: "Option A",
          isCorrect: true,
          isLeft: true,
          questionId,
        },
        {
          option: "Option B",
          isCorrect: false,
          isLeft: false,
          questionId,
        },
      );
    }

    await prisma.questionOption.createMany({
      data: optionsData,
    });

    // Fetch created options
    questionOptions = await prisma.questionOption.findMany({
      where: {
        questionId: {
          in: [question1Id, question2Id, question3Id, question4Id],
        },
      },
    });

    // Link questions to decks
    const deckQuestions = await Promise.all([
      prisma.deckQuestion.create({
        data: {
          deckId: deck1Id,
          questionId: question1Id,
        },
      }),
      prisma.deckQuestion.create({
        data: {
          deckId: deck2Id,
          questionId: question2Id,
        },
      }),
      prisma.deckQuestion.create({
        data: {
          deckId: deck3Id,
          questionId: question3Id,
        },
      }),
      prisma.deckQuestion.create({
        data: {
          deckId: deck4Id,
          questionId: question4Id,
        },
      }),
    ]);

    deckQuestionIds = deckQuestions.map((dq) => dq.id);

    // Create answers for questions 1, 2, and 3 (not 4)
    const question1Options = questionOptions.filter(
      (opt) => opt.questionId === question1Id,
    );
    const question2Options = questionOptions.filter(
      (opt) => opt.questionId === question2Id,
    );
    const question3Options = questionOptions.filter(
      (opt) => opt.questionId === question3Id,
    );

    await Promise.all([
      // Answer for question 1
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question1Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
      // Answer for question 2
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question2Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
      // Answer for question 3
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question3Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
    ]);
  });

  afterAll(async () => {
    // Clean up in reverse order

    if (mysteryBoxId) {
      const box = await prisma.mysteryBox.findFirstOrThrow({
        where: { id: mysteryBoxId },
        include: { triggers: { include: { MysteryBoxPrize: true } } },
      });
      const triggerIds = box.triggers.map((trigger) => trigger.id);
      const prizeIds = box.triggers.flatMap((trigger) =>
        trigger.MysteryBoxPrize.map((prize) => prize.id),
      );
      await prisma.mysteryBoxPrize.deleteMany({
        where: { id: { in: prizeIds } },
      });
      await prisma.mysteryBoxTrigger.deleteMany({
        where: { id: { in: triggerIds } },
      });
      await prisma.mysteryBox.delete({ where: { id: mysteryBoxId } });
    }

    await prisma.questionAnswer.deleteMany({
      where: {
        userId,
        questionOptionId: {
          in: questionOptions.map((opt) => opt.id),
        },
      },
    });

    await prisma.deckQuestion.deleteMany({
      where: {
        id: {
          in: deckQuestionIds,
        },
      },
    });

    await prisma.questionOption.deleteMany({
      where: {
        questionId: {
          in: [question1Id, question2Id, question3Id, question4Id],
        },
      },
    });

    await prisma.question.deleteMany({
      where: {
        id: {
          in: [question1Id, question2Id, question3Id, question4Id],
        },
      },
    });

    await prisma.deck.deleteMany({
      where: {
        id: {
          in: [deck1Id, deck2Id, deck3Id, deck4Id],
        },
      },
    });

    await prisma.user.delete({
      where: { id: userId },
    });
  });

  it("should return decks with at least one answered question", async () => {
    const result = await getAnsweredDecksForHistory(userId, 10, 1);

    // Should return only deck1 and deck2 (revealed decks with answers)
    expect(result).toHaveLength(3);

    const deckIds = result.map((deck) => deck.id);
    expect(deckIds).toContain(deck1Id);
    expect(deckIds).toContain(deck2Id);
    expect(deckIds).toContain(deck3Id); // Future deck
    expect(deckIds).not.toContain(deck4Id); // No answers, should not be included
  });

  it("should correctly calculate total_reward_amount and total_credit_cost", async () => {
    const result = await getAnsweredDecksForHistory(userId, 10, 1);

    // Find deck1 in results (the one with rewards)
    const deck1Result = result.find((deck) => deck.id === deck1Id);
    expect(deck1Result).toBeDefined();

    expect(Number(deck1Result?.total_reward_amount)).toBe(0);

    expect(Number(deck1Result?.total_potential_reward_amount)).toBe(100);
    expect(Number(deck1Result?.total_credit_cost)).toBe(2);

    // Find deck2 in results (the one without rewards)
    const deck2Result = result.find((deck) => deck.id === deck2Id);
    expect(deck2Result).toBeDefined();
    expect(Number(deck2Result?.total_potential_reward_amount)).toBe(0);
    expect(Number(deck2Result?.total_reward_amount)).toBe(0);
    expect(Number(deck2Result?.total_credit_cost)).toBe(0);
  });

  it("should correctly calculate rewards after mystery box creation", async () => {
    const box = await prisma.mysteryBox.create({
      data: {
        status: EMysteryBoxStatus.Opened,
        userId,
        triggers: {
          create: [
            {
              questionId: question1Id,
              triggerType: EBoxTriggerType.ValidationReward,
              MysteryBoxPrize: {
                createMany: {
                  data: [
                    {
                      tokenAddress: process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "",
                      prizeType: EBoxPrizeType.Token,
                      amount: "50",
                      size: EPrizeSize.Small,
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    mysteryBoxId = box.id;

    const result = await getAnsweredDecksForHistory(userId, 10, 1);

    const deck1Result = result.find((deck) => deck.id === deck1Id);
    expect(deck1Result).toBeDefined();
    expect(Number(deck1Result?.total_reward_amount)).toBe(50);
  });

  it("should respect pagination parameters", async () => {
    // Test with page size 1, page 1
    const page1Result = await getAnsweredDecksForHistory(userId, 1, 1);
    expect(page1Result).toHaveLength(1);

    // Test with page size 1, page 2
    const page2Result = await getAnsweredDecksForHistory(userId, 1, 2);
    expect(page2Result).toHaveLength(1);

    // Ensure page 1 and page 2 return different decks
    expect(page1Result[0].id).not.toBe(page2Result[0].id);
  });

  it("should return empty array when no decks match criteria", async () => {
    // Delete all answers to simulate no matching decks
    await prisma.questionAnswer.deleteMany({
      where: { userId },
    });

    const result = await getAnsweredDecksForHistory(userId, 10, 1);
    expect(result).toHaveLength(0);

    // Recreate answers for cleanup
    const question1Options = questionOptions.filter(
      (opt) => opt.questionId === question1Id,
    );
    const question2Options = questionOptions.filter(
      (opt) => opt.questionId === question2Id,
    );
    const question3Options = questionOptions.filter(
      (opt) => opt.questionId === question3Id,
    );

    await Promise.all([
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question1Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question2Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
      prisma.questionAnswer.create({
        data: {
          userId,
          questionOptionId: question3Options[0].id,
          selected: true,
          status: AnswerStatus.Submitted,
        },
      }),
    ]);
  });

  it("should return the correct deck properties", async () => {
    const result = await getAnsweredDecksForHistory(userId, 10, 1);

    // Check that all required properties are present
    const deck = result.find((d) => d.id === deck1Id);
    expect(deck).toHaveProperty("id");
    expect(deck).toHaveProperty("deck");
    expect(deck).toHaveProperty("revealAtDate");
    expect(deck).toHaveProperty("total_reward_amount");
    expect(deck).toHaveProperty("total_credit_cost");
    expect(deck).toHaveProperty("answeredQuestions");
    expect(deck).toHaveProperty("totalQuestions");

    // Check specific values
    expect(deck?.deck).toBe("Premium Deck");
  });
});
