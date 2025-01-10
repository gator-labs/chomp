import { PrismaClient, QuestionType, Token } from "@prisma/client";
import { format } from "date-fns";

import { askQuestion, generateUsers, selectOption } from "./utils";

console.log(
  "\x1b[34m\x1b[1m --- SCRIPT FOR CREATING BINARY OBJECTIVE QUESTION --- \x1b[0m",
);
console.log("Loaded environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  const correctOption = await selectOption(
    "Select correct option for question.",
    ["A", "B"],
  );

  const tag = await askQuestion("Insert tag name: ");
  const currentDate = new Date();

  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Deck ${format(currentDate, "MM/dd/yyyy")}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activeFromDate: new Date(),
      deckQuestions: {
        create: {
          question: {
            create: {
              question: tag + ": Lorem ipsum?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 10,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              durationMiliseconds: BigInt(60000),
              questionOptions: {
                create: [
                  {
                    option: "A",
                    isCorrect: correctOption === "A",
                    isLeft: true,
                  },
                  {
                    option: "B",
                    isCorrect: correctOption === "B",
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

  console.log(questionOptions);
  await Promise.all(
    users.map(async (user) => {
      const selectedOption = questionOptions[Math.floor(Math.random() * 2)];
      const secondOrderOption = questionOptions[Math.floor(Math.random() * 2)];

      await Promise.all(
        questionOptions.map(async (option) => {
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
        }),
      );
    }),
  );
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
