const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const prisma = new PrismaClient();

async function deleteReadyToRevealDecks() {
  try {
    const decksToDelete = await prisma.deck.findMany({
      where: {
        revealAtDate: {
          lte: new Date(),
        },
        isActive: true,
      },
      include: {
        deckQuestions: {
          include: {
            question: {
              include: {
                questionOptions: {
                  include: {
                    questionAnswers: true, // Include question answers to delete them first
                  },
                },
              },
            },
          },
        },
        userDeck: true, // Include userDeck to delete them first
      },
    });

    console.log(
      `Found ${decksToDelete.length} decks ready to reveal for deletion.`,
    );

    // Deleting the decks and their related questions, options, answers, deck questions, and userDeck
    for (const deck of decksToDelete) {
      console.log(`Deleting deck ID: ${deck.id} - ${deck.deck}`);

      // Delete all related deckQuestions and their questions
      for (const deckQuestion of deck.deckQuestions) {
        const questionId = deckQuestion.question.id;
        console.log(
          `Deleting question ID: ${questionId} - ${deckQuestion.question.question}`,
        );

        // Delete question answers first
        for (const option of deckQuestion.question.questionOptions) {
          console.log(`Deleting answers for question option ID: ${option.id}`);
          await prisma.questionAnswer.deleteMany({
            where: { questionOptionId: option.id },
          });
        }

        // Delete question options next
        console.log(`Deleting options for question ID: ${questionId}`);
        await prisma.questionOption.deleteMany({
          where: { questionId: questionId },
        });

        // Delete deck questions that reference this question
        console.log(`Deleting deck questions for question ID: ${questionId}`);
        await prisma.deckQuestion.deleteMany({
          where: { questionId: questionId },
        });

        // Then delete the question
        await prisma.question.delete({
          where: { id: questionId },
        });
      }

      // Delete userDeck records referencing this deck
      console.log(`Deleting userDecks for deck ID: ${deck.id}`);
      await prisma.userDeck.deleteMany({
        where: { deckId: deck.id },
      });

      // Delete the deck itself
      await prisma.deck.delete({
        where: { id: deck.id },
      });

      console.log(`Deleted deck ID: ${deck.id} and its associated questions.`);
    }
  } catch (error) {
    console.error("Error deleting ready-to-reveal decks:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function to delete ready-to-reveal decks
deleteReadyToRevealDecks().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
