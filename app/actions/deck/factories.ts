import { DeckImportModel } from "@/app/schemas/deckImport";
import { onlyUnique } from "@/app/utils/array";
import { parseDateToDateDefaultUtc } from "@/app/utils/date";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { Prisma } from "@prisma/client";

import { questionOptionFactory } from "../question/factories";

export const deckInputFactory = (
  decks: DeckImportModel[],
): {
  deck: Prisma.DeckCreateInput;
  questions: Prisma.QuestionCreateInput[];
}[] => {
  const uniqueDecks = decks.map((deck) => deck.deck).filter(onlyUnique);
  const decksMapped = uniqueDecks.map((deck) => {
    const deckQuestions = decks.filter((d) => d.deck === deck);
    const deckInfo = deckQuestions[0];

    const deckMapped = {
      deck: deck,
      date: deckInfo.dailyDate,
      revealAtAnswerCount: deckInfo.revealAtAnswerCount,
      revealAtDate: parseDateToDateDefaultUtc(deckInfo.revealAtDate),
      imageUrl: deckInfo.deckImageUrl,
    } satisfies Prisma.DeckCreateInput;

    const questionsMapped = deckQuestions.map(
      (question) =>
        ({
          question: question.question,
          type: question.type,
          durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
          imageUrl: question.imageUrl,
          revealTokenAmount: question.revealTokenAmount,
          revealAtAnswerCount: deckInfo.revealAtAnswerCount,
          revealAtDate: parseDateToDateDefaultUtc(deckInfo.revealAtDate),
          revealToken: "Bonk",
          questionOptions: {
            createMany: {
              data: questionOptionFactory(question),
            },
          },
        }) satisfies Prisma.QuestionCreateInput,
    );

    return { deck: deckMapped, questions: questionsMapped };
  });

  return decksMapped;
};
