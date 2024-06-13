const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const { PrismaClient, QuestionType, Token } = require("@prisma/client");
const axios = require("axios");

console.log("Loaded environment variables:");
console.log("DATABASE_PRISMA_URL:", process.env.DATABASE_PRISMA_URL);
console.log(
  "NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID:",
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
);
console.log("DYNAMIC_BEARER_TOKEN:", process.env.DYNAMIC_BEARER_TOKEN);

const prisma = new PrismaClient();

// Helper function to create users with dynamic IDs
async function createUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    try {
      const { data } = await axios.post(
        `https://app.dynamicauth.com/api/v0/environments/${process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID}/users`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.DYNAMIC_BEARER_TOKEN}`,
          },
        },
      );

      console.log(`Created user ${i + 1} with data:`, data);

      // Ensure we're extracting the id from the nested user object
      if (data && data.user && data.user.id) {
        users.push({
          id: data.user.id,
          username: `user${i + 1}`,
        });
      } else {
        console.error(`Failed to create user ${i + 1}: Invalid response`, data);
      }
    } catch (error: any) {
      console.error(`Error creating user ${i + 1}:`, error.message);
    }
  }
  return users;
}

// Main function to execute the script
async function main() {
  // Create a deck with one question
  const deck = await prisma.deck.create({
    data: {
      deck: "Sample Deck",
      date: new Date(),
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
      isActive: true,
      deckQuestions: {
        create: {
          question: {
            create: {
              question: "Is the sky blue?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 0,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
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

  // Create 10 users and store them in the database
  const users = await createUsers(10);

  // Filter out any users that failed to be created
  const validUsers = users.filter((user) => user.id);

  if (validUsers.length > 0) {
    await prisma.user.createMany({
      data: validUsers,
    });
    console.log(`Created ${validUsers.length} users`);
  } else {
    console.error("No valid users were created.");
  }

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

  for (const user of validUsers) {
    const selectedOption =
      questionOptionIds[Math.floor(Math.random() * questionOptionIds.length)];
    await prisma.questionAnswer.create({
      data: {
        userId: user.id,
        questionOptionId: selectedOption.id,
        selected: true,
        timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer
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
