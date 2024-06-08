"use client";

import { DailyDeckTitle } from "@chomp/app/components/DailyDeckTitle/DailyDeckTitle";
import { Deck, Question } from "@chomp/app/components/Deck/Deck";
import Disabled from "@chomp/app/components/Disabled/Disabled";
import { Navbar, NavbarProps } from "@chomp/app/components/Navbar/Navbar";
import { NoQuestionsCard } from "@chomp/app/components/NoQuestionsCard/NoQuestionsCard";
import { TabNavigation } from "@chomp/app/components/TabNavigation/TabNavigation";
import { useState } from "react";

interface Props {
  date?: Date | null;
  questions?: Question[];
  id?: number;
  isAdmin: boolean;
  navBarData: NavbarProps;
}

const DailyDeckScreen = ({
  date,
  questions,
  id,
  isAdmin,
  navBarData,
}: Props) => {
  const [hasReachedEnd, setHasReachedEnd] = useState(!questions?.length);

  return (
    <>
      <div className="flex flex-col h-full">
        <main className="flex-grow overflow-y-auto mb-2 h-full w-full max-w-lg mx-auto">
          <div className="flex flex-col h-full px-4">
            <Disabled
              disabled={!hasReachedEnd}
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
                  deckVariant="daily-deck"
                  questions={questions}
                  deckId={id!}
                  browseHomeUrl="/application"
                  setHasReachedEnd={setHasReachedEnd}
                />
              ) : (
                <NoQuestionsCard
                  browseHomeUrl="/application"
                  variant="daily-deck"
                />
              )}
            </div>
          </div>
        </main>
        <Disabled
          className="after:opacity-90 after:bg-[#1B1B1B]"
          disabled={!hasReachedEnd}
          toastMessage="Please complete this Daily Deck first ✨"
        >
          <TabNavigation isAdmin={isAdmin} />
        </Disabled>
      </div>
    </>
  );
};

export default DailyDeckScreen;
