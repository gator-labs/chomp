import { PrismaClient, QuestionType, Token } from "@prisma/client";

import { generateUsers } from "./utils";

console.log("Loaded environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  const revealAtDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const deck = await prisma.deck.create({
    data: {
      deck: "Superteam Philippines - Solana Trivia Night! Test",
      revealAtDate: revealAtDate,
      isActive: true,
    },
  });

  const questions = [
    {
      question: "Anatoly Yakovenko founded Solana in 2015.",
      type: QuestionType.BinaryQuestion,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "True",
          isLeft: true,
          isCorrect: false,
        },
        {
          option: "False",
          isLeft: false,
          isCorrect: true,
        },
      ],
    },
    {
      question:
        "Solana uses a hybrid consensus mechanism combining Proof of Work and Proof of Stake",
      type: QuestionType.BinaryQuestion,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "True",
          isLeft: true,
          isCorrect: false,
        },
        {
          option: "False",
          isLeft: false,
          isCorrect: true,
        },
      ],
    },
    {
      question:
        "In which programming language are Solana smart contracts typically written?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "JavaScript",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Solidity",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Rust",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Python",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question:
        "What is the maximum theoretical transactions per second (TPS) that Solana can process?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "45000",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "65000",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "100000",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "1 Million",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question: "What is the name of Solana's annual conference?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "Hyperdrive",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Renaissance",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Breakpoint",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Colosseum",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question: "Who is the Head of Developer Ecosystem at Solana?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "Chase Barker",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Kash Dhanda",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Raj Gokal",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Lily Liu",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question:
        "Which of the following NFT projects is NOT part of the Solana ecosystem?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "DeGods",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Azuki",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Mad Lads",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Okay Bears",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question:
        "If Solana's Proof of History were to fail, which of the following would most likely occur?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "The network would immediately halt.",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "The network would immediately halt.",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "The network would fall back to standard Proof of Stake.",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Validators would switch to Proof of Work.",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question: "Which of the following is NOT a feature of Solana?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "High throughput",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Low latency",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Low transaction costs",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Unlimited block size",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
    {
      question: "What is the smallest unit of SOL called?",
      type: QuestionType.MultiChoice,
      revealAtDate: revealAtDate,
      questionOptions: [
        {
          option: "Satoshi",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Lamport",
          isLeft: false,
          isCorrect: true,
        },
        {
          option: "Gwei",
          isLeft: false,
          isCorrect: false,
        },
        {
          option: "Finney",
          isLeft: false,
          isCorrect: false,
        },
      ],
    },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: {
        question: question.question,
        type: question.type,
        revealToken: Token.Bonk,
        revealTokenAmount: 500,
        revealAtDate: question.revealAtDate,
        durationMiliseconds: 60000,
        deckQuestions: {
          create: {
            deckId: deck.id,
          },
        },
        questionOptions: {
          createMany: {
            data: question.questionOptions,
          },
        },
      },
    });
  }

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
    include: {
      question: true,
    },
  });

  let secondOrderOptionIndex = 0;

  for (const user of users) {
    let questionType;
    let lastQuestionAnswer;

    for (const option of questionOptions) {
      const selectedOption =
        questionOptions[
          Math.floor(
            Math.random() *
              (option.question.type === QuestionType.MultiChoice ? 4 : 2),
          )
        ];

      console.log({
        secondOrderOptionIndex,
        userId: user.id,
        selectedOptionId: selectedOption.id,
      });
      const secondOrderOption = questionOptions[secondOrderOptionIndex];

      questionType = option.question.type;
      const isSelectedOption = option.id === selectedOption.id;
      const percentage = Math.floor(Math.random() * 100);

      lastQuestionAnswer = await prisma.questionAnswer.create({
        data: {
          userId: user.id,
          questionOptionId: option.id,
          percentage: percentage,
          selected: isSelectedOption,
          timeToAnswer: BigInt(Math.floor(Math.random() * 60000)),
        },
      });
    }

    if (questionType === QuestionType.MultiChoice) {
      secondOrderOptionIndex =
        secondOrderOptionIndex === 3 ? 0 : secondOrderOptionIndex + 1;
    } else {
      secondOrderOptionIndex =
        secondOrderOptionIndex >= 1 ? 0 : secondOrderOptionIndex + 1;
    }
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
