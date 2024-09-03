import { QuestionImportModel } from "@/app/schemas/questionImport";
import { parseDateToDateDefaultUtc } from "@/app/utils/date";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { Prisma, QuestionOption } from "@prisma/client";

const INDEX_OFFSET = 1;
const INDEX_OPTION_LEFT = 1;
const INDEX_OPTION_RIGHT = 2;

export const questionInputFactory = (
  questions: QuestionImportModel[],
): Prisma.QuestionCreateInput[] => {
  const questionsMapped = questions.map((question) => {
    const questionMapped = {
      question: question.question,
      type: question.type,
      durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
      imageUrl: question.imageUrl,
      revealTokenAmount: question.revealTokenAmount,
      revealAtAnswerCount: question.revealAtAnswerCount,
      revealAtDate: parseDateToDateDefaultUtc(question.revealAtDate),
      revealToken: "Bonk",
      questionOptions: {
        createMany: {
          data: questionOptionFactory(question),
        },
      },
    } satisfies Prisma.QuestionCreateInput;

    return questionMapped;
  });

  return questionsMapped;
};

export const questionOptionFactory = (
  question: QuestionImportModel,
): QuestionOption[] => {
  switch (question.type) {
    case "BinaryQuestion":
      return binaryQuestionOptionFactory(question);
    case "MultiChoice":
      return multipleQuestionOptionFactory(question);
  }
};

const binaryQuestionOptionFactory = (
  binaryChoiceQuestion: QuestionImportModel,
): QuestionOption[] => {
  if (binaryChoiceQuestion.type !== "BinaryQuestion") {
    return [];
  }

  const options = [
    {
      option: binaryChoiceQuestion.binaryLeftOption,
      isLeft: true,
      isCorrect: binaryChoiceQuestion.optionTrue === INDEX_OPTION_LEFT,
    },
    {
      option: binaryChoiceQuestion.binaryRightOption,
      isLeft: false,
      isCorrect: binaryChoiceQuestion.optionTrue === INDEX_OPTION_RIGHT,
    },
  ] as QuestionOption[];

  return options;
};

const multipleQuestionOptionFactory = (
  multipleChoiceQuestion: QuestionImportModel,
): QuestionOption[] => {
  if (multipleChoiceQuestion.type !== "MultiChoice") {
    return [];
  }

  const optionLabels = [
    multipleChoiceQuestion.multipleChoiceOptionOne,
    multipleChoiceQuestion.multipleChoiceOptionTwo,
    multipleChoiceQuestion.multipleChoiceOptionThree,
    multipleChoiceQuestion.multipleChoiceOptionFour,
  ];

  const options = optionLabels.map(
    (op, index) =>
      ({
        option: op,
        isLeft: false,
        isCorrect: multipleChoiceQuestion.optionTrue === index + INDEX_OFFSET,
      }) as QuestionOption,
  );

  return options;
};
