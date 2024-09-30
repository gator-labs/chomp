import {
  FungibleAsset,
  PrismaClient,
  QuestionType,
  Token,
  TransactionLogType,
} from "@prisma/client";
import { format } from "date-fns";
import { generateUsers } from "./utils";

console.log("Loaded environment variables:");
console.log("DATABASE_PRISMA_URL:", process.env.DATABASE_PRISMA_URL);

const prisma = new PrismaClient();

async function main() {
  const currentDate = new Date();

  const stack = await prisma.stack.create({
    data: {
      isActive: true,
      name: "Bonkaton",
      image:
        "https://chomp-staging.s3.eu-north-1.amazonaws.com/cd22a4d3-556e-4899-be89-837ded272cb3",
    },
  });

  const deck = await prisma.deck.create({
    data: {
      deck: `Bonkaton: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      stackId: stack.id,
      deckQuestions: {
        create: {
          question: {
            create: {
              stackId: stack.id,
              question: "Bonkaton question?",
              type: QuestionType.MultiChoice,
              revealToken: Token.Bonk,
              revealTokenAmount: 10,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              durationMiliseconds: BigInt(60000),
              questionOptions: {
                create: [
                  {
                    option: "A",
                    isCorrect: true,
                    isLeft: false,
                  },
                  {
                    option: "B",
                    isCorrect: false,
                    isLeft: false,
                  },
                  {
                    option: "C",
                    isCorrect: false,
                    isLeft: false,
                  },
                  {
                    option: "D",
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

  console.log(`Created deck with ID: ${deck.id}`);

  const users = await generateUsers(50);

  await prisma.user.createMany({
    data: users,
  });

  console.log(`Created ${users.length} users`);

  const questionOptions = await prisma.questionOption.findMany({
    where: {
      question: {
        deckQuestions: {
          some: {
            deckId: deck.id,
          },
        },
      },
    },
  });

  let secondOrderOptionIndex = 0;

  for (const user of users) {
    const selectedOption = questionOptions[Math.floor(Math.random() * 4)];
    const secondOrderOption = questionOptions[secondOrderOptionIndex];

    for (const option of questionOptions) {
      const isSelectedOption = option.id === selectedOption.id;
      const percentage =
        secondOrderOption.id === option.id
          ? Math.floor(Math.random() * 100)
          : null;

      await prisma.questionAnswer.create({
        data: {
          userId: user.id,
          questionOptionId: option.id,
          percentage: percentage,
          selected: isSelectedOption,
          timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
        },
      });

      await prisma.fungibleAssetTransactionLog.create({
        data: {
          userId: user.id,
          questionId: option.questionId,
          asset: FungibleAsset.Point,
          change: Math.floor(Math.random() * 100),
          type: TransactionLogType.AnswerQuestion,
        },
      });
    }
    secondOrderOptionIndex =
      secondOrderOptionIndex === 3 ? 0 : secondOrderOptionIndex + 1;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
