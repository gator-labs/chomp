import { PrismaClient, QuestionType, Token } from "@prisma/client";
import { format } from "date-fns";
import { askQuestion, generateUsers, selectOption } from "../../scripts/utils";

const prisma = new PrismaClient();

export async function createQuestion() {
    const correctOption = "A"
  
    const tag = "e2e"
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
  
    console.log(questionOptions);
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
      }
      secondOrderOptionIndex =
        secondOrderOptionIndex === 3 ? 0 : secondOrderOptionIndex + 1;
    }

    return {deckId: deck.id, questionOptions}
  }