const path = require("path");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const { PrismaClient, QuestionType, Token } = require("@prisma/client");

console.log("Loaded environment variables:");
console.log("DATABASE_PRISMA_URL:", process.env.DATABASE_PRISMA_URL);

const prisma = new PrismaClient();

async function createUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: uuidv4(), // Generate a unique UUID for each user
      username: `user${i + 1}`,
    });
  }
  await prisma.user.createMany({
    data: users,
  });
  return users;
}

// Main function to execute the script
async function main() {
  // Create a deck with one question
  const deck = await prisma.deck.create({
    data: {
      deck: "Sample Deck",
      /*       date: new Date(), */ // uncomment to set the deck in daily category
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
      isActive: true,
      deckQuestions: {
        create: {
          question: {
            create: {
              question: "Is the sky blue?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 100,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
              durationMiliseconds: BigInt(600000), // Longer time to answer for testing
              questionOptions: {
                create: [
                  { option: "True", isCorrect: true, isLeft: true },
                  { option: "False", isCorrect: false, isLeft: false },
                ],
              },
            },
          },
        },
      },
    },
  });

  console.log(`Created deck with ID: ${deck.id}`);

  // Create 10 users directly in the database
  const users = await createUsers(20);

  console.log(`Created ${users.length} users`);

  // Simulate users answering the question randomly
  const questionOptionIds = await prisma.questionOption.findMany({
    where: {
      question: {
        deckQuestions: {
          some: {
            deckId: deck.id,
          },
        },
      },
    },
    select: { id: true },
  });

  for (const user of users) {
    const selectedOption =
      questionOptionIds[Math.floor(Math.random() * questionOptionIds.length)];
    await prisma.questionAnswer.create({
      data: {
        userId: user.id,
        questionOptionId: selectedOption.id,
        selected: true,
        timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer within 60 seconds
      },
    });
  }

  console.log("Users have answered the question randomly");
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
