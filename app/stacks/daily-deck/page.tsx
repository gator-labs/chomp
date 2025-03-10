import StackDeckCard from "@/app/components/StackDeckCard/StackDeckCard";
import StacksHeader from "@/app/components/StacksHeader/StacksHeader";
import { getDailyDecks } from "@/app/queries/stack";
import { getCurrentUser } from "@/app/queries/user";
import { getTotalNumberOfDeckQuestions } from "@/app/utils/question";
import Image from "next/image";

const StackPage = async () => {
  const [user, dailyDecks] = await Promise.all([
    getCurrentUser(),
    getDailyDecks(),
  ]);

  const totalNumberOfCards = getTotalNumberOfDeckQuestions(
    dailyDecks.decks.flatMap((d) => d.deckQuestions),
  );

  return (
    <div className="flex flex-col gap-2 pt-4 overflow-hidden pb-2">
      <StacksHeader backAction="stacks" className="px-4" />
      <div className="p-4 bg-gray-850 flex gap-4">
        <div className="relative w-[100.5px] h-[100.5px]">
          <Image
            src="/images/chompy.png"
            fill
            alt="Daily Decks"
            className="object-cover"
            sizes="(max-width: 600px) 80px, (min-width: 601px) 100.5px"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base mb-3">Daily Decks</h1>
          <p className="text-xs mb-6">
            {dailyDecks.decks.length} deck
            {dailyDecks.decks.length === 1 ? "" : "s"}, {totalNumberOfCards}{" "}
            cards
          </p>
        </div>
      </div>
      <div className="py-2 px-4 mb-2">
        <p className="text-sm">Decks</p>
      </div>
      <ul className="flex flex-col gap-2 px-4 overflow-auto">
        {dailyDecks.decks.map((deck) => {
          return (
            <StackDeckCard
              key={deck.id}
              deckId={deck.id}
              deckName={deck.deck}
              imageUrl={
                deck.imageUrl
                  ? deck.imageUrl.startsWith("https")
                    ? deck.imageUrl
                    : `/images/chompy.png`
                  : "/images/chompy.png"
              }
              revealAtDate={deck.revealAtDate!}
              userId={user?.id}
              deckCreditCost={deck.totalCreditCost}
              deckRewardAmount={deck.totalRewardAmount}
              answeredQuestions={
                deck.deckQuestions
                  .flatMap((dq) =>
                    dq.question.questionOptions.flatMap(
                      (qo) => qo.questionAnswers,
                    ),
                  )
                  .filter(
                    (qa) =>
                      qa.userId === user?.id &&
                      (qa.status === "Submitted" || qa.status === "Viewed"),
                  ).length / 2
              }
              totalQuestions={deck.deckQuestions.length}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default StackPage;
