"use client";

import { DailyDeckTitle } from "@/app/components/DailyDeckTitle/DailyDeckTitle";
import { Deck, Question } from "@/app/components/Deck/Deck";
import Disabled from "@/app/components/Disabled/Disabled";
import { Navbar, NavbarProps } from "@/app/components/Navbar/Navbar";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import { TabNavigation } from "@/app/components/TabNavigation/TabNavigation";
import { getAnsweredQuestionsStatus } from "@/app/utils/question";

interface Props {
  nextDeckId?: number;
  date?: Date | null;
  questions?: Question[];
  id?: number;
  navBarData: NavbarProps;
  isAdmin: boolean;
  percentOfAnsweredQuestions: number;
}

const DailyDeckScreen = ({
  nextDeckId,
  date,
  questions,
  id,
  navBarData,
  percentOfAnsweredQuestions,
  isAdmin,
}: Props) => {
  const deckVariant = getAnsweredQuestionsStatus(percentOfAnsweredQuestions);

  return (
    <>
      <div className="flex flex-col h-full">
        <main className="flex-grow overflow-y-auto mb-2 h-full w-full max-w-lg mx-auto">
          <div className="flex flex-col h-full px-4">
            <Disabled
              disabled={!!questions?.length}
              toastMessage="Please complete this Daily Deck first ✨"
            >
              <Navbar {...navBarData} />
            </Disabled>

            <div className="py-3">
              <DailyDeckTitle date={date ?? new Date()} />
            </div>
            <div className="flex-1">
              {!!questions?.length ? (
                <Deck
                  questions={questions}
                  deckId={id!}
                  nextDeckId={nextDeckId}
                />
              ) : (
                <NoQuestionsCard
                  nextDeckId={nextDeckId}
                  variant={deckVariant}
                />
              )}
            </div>
          </div>
        </main>
        <Disabled
          className="after:opacity-90 after:bg-gray-800"
          disabled={!!questions?.length}
          toastMessage="Please complete this Daily Deck first ✨"
        >
          <TabNavigation isAdmin={isAdmin} />
        </Disabled>
      </div>
    </>
  );
};

export default DailyDeckScreen;
