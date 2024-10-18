"use client";

import { DailyDeckTitle } from "@/app/components/DailyDeckTitle/DailyDeckTitle";
import { Deck, Question } from "@/app/components/Deck/Deck";
import { Navbar, NavbarProps } from "@/app/components/Navbar/Navbar";
import { NoQuestionsCard } from "@/app/components/NoQuestionsCard/NoQuestionsCard";
import { TabNavigation } from "@/app/components/TabNavigation/TabNavigation";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { getAnsweredQuestionsStatus } from "@/app/utils/question";
import trackEvent from "@/lib/trackEvent";
import { useEffect } from "react";

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

  useEffect(() => {
    if (questions?.length && id) {
      trackEvent(TRACKING_EVENTS.DECK_STARTED, {
        [TRACKING_METADATA.DECK_ID]: id,
        [TRACKING_METADATA.IS_DAILY_DECK]: true,
      });
    }
  }, [id]);

  return (
    <>
      <div className="flex flex-col h-full">
        <main className="flex-grow overflow-y-auto mb-2 h-full w-full max-w-lg mx-auto">
          <div className="flex flex-col px-4">
            <Navbar {...navBarData} />

            <div className="py-3">
              <DailyDeckTitle date={date ?? new Date()} />
            </div>
            {!!questions?.length ? (
              <Deck
                questions={questions}
                deckId={id!}
                nextDeckId={nextDeckId}
              />
            ) : (
              <NoQuestionsCard nextDeckId={nextDeckId} variant={deckVariant} />
            )}
          </div>
        </main>
        <TabNavigation isAdmin={isAdmin} />
      </div>
    </>
  );
};

export default DailyDeckScreen;
