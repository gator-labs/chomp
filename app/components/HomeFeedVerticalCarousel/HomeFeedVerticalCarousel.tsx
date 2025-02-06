"use client";

import { ReactNode, useState } from "react";
import "swiper/css";

import DeckSwitchTabs from "../DeckSwitchTabs/DeckSwitchTabs";
import { DECK_FILTERS } from "../DeckSwitchTabs/constants";
import FreeDeckFeed from "../FreeDeckFeed/FreeDeckFeed";
import { InfoIcon } from "../Icons/InfoIcon";
import InfoDrawer from "../InfoDrawer/InfoDrawer";
import PaidDeckFeed from "../PaidDeckFeed/PaidDeckFeed";

type HomeFeedVerticalCarouselProps = {
  title: ReactNode;
  className?: string;
};

export function HomeFeedVerticalCarousel({
  title,
  className,
}: HomeFeedVerticalCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(DECK_FILTERS[0].value);

  return (
    <>
      <InfoDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose your path: Validate or Practice"
        description={`Validate: These paid decks help build trusted information and offer rewards for correct answers.\n Practice: Play without paying and learn at your own pace. While these decks don't offer rewards, you might discover some fun surprises along the way.`}
      />

      <div className={className}>
        <div className="flex justify-between items-center mb-2">
          <div>{title}</div>
          <button onClick={() => setIsOpen(true)}>
            <InfoIcon width={18} height={18} fill="#999999" />
          </button>
        </div>
        <DeckSwitchTabs
          activeFilter={activeFilter}
          onClick={(value: string) => {
            setActiveFilter(value);
          }}
        />
        {activeFilter === DECK_FILTERS[0].value ? (
          <PaidDeckFeed />
        ) : DECK_FILTERS[1].value === activeFilter ? (
          <FreeDeckFeed />
        ) : null}
      </div>
    </>
  );
}
