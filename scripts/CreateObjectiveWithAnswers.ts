const { v4: uuidv4 } = require("uuid");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const tag = "Test";

const { PrismaClient, QuestionType, Token } = require("@prisma/client");

console.log("Loaded environment variables:");
console.log("DATABASE_PRISMA_URL:", process.env.DATABASE_PRISMA_URL);

const prisma = new PrismaClient();

async function createUsers(count: number) {
  const users: { id: string; username: string }[] = [];
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

async function main(
  correctOption: string = "first",
  userSelectionMode: string,
) {
  // Create a deck with one question
  const deck = await prisma.deck.create({
    data: {
      deck: `${tag}: Sample Deck ${new Date(Date.now())}`,
      revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
      deckQuestions: {
        create: {
          question: {
            create: {
              question: tag + ": Is the sky blue?",
              type: QuestionType.BinaryQuestion,
              revealToken: Token.Bonk,
              revealTokenAmount: 100,
              revealAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reveal 24 hours later
              durationMiliseconds: BigInt(600000), // Longer time to answer for testing
              questionOptions: {
                create: [
                  {
                    option: "True",
                    isCorrect: correctOption === "first",
                    isLeft: true,
                  },
                  {
                    option: "False",
                    isCorrect: correctOption === "second",
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

  // Create 20 users directly in the database
  const users = await createUsers(20);

  console.log(`Created ${users.length} users`);

  // Fetch the options for the created question
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

  // Determine the selected option based on the input parameter
  const selectedOption =
    userSelectionMode === "first"
      ? questionOptions[0]
      : userSelectionMode === "second"
        ? questionOptions[1]
        : null;

  // Simulate users answering the question with the specified option
  for (const user of users) {
    // Assign percentages and selection status
    for (const option of questionOptions) {
      // Random percentage for the first option
      const randomPercentage = Math.floor(Math.random() * 100);
      // Calculate the remaining percentage for the other option
      const remainingPercentage = 100 - randomPercentage;
      const isSelectedOption =
        option.id ===
        (selectedOption
          ? selectedOption.id
          : questionOptions[Math.floor(Math.random() * questionOptions.length)]
              .id);

      // Apply percentages such that they sum up to 100 for each user's answer set
      await prisma.questionAnswer.create({
        data: {
          userId: user.id,
          questionOptionId: option.id,
          percentage: option.isLeft ? randomPercentage : remainingPercentage,
          selected: isSelectedOption,
          timeToAnswer: BigInt(Math.floor(Math.random() * 60000)), // Random time to answer within 60 seconds
        },
      });
    }
  }

  console.log(
    `Users have answered the question with the ${userSelectionMode} option`,
  );
}

// Parse the command line arguments to determine which option to select
const args = process.argv.slice(2);
const correctOption = args[0]; // The first argument is the correct option ("first" or "second")
const userSelectionMode = args[1]; // The second argument is the user selection mode ("first" or "second")

main(correctOption, userSelectionMode)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
