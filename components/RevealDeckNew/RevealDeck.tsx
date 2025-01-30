import { getDeckTotalClaimableRewards } from "@/app/actions/history";
import BackButton from "@/app/components/BackButton/BackButton";
import { getAllDeckQuestionsReadyForReveal } from "@/app/queries/history";
import { getProfileImage } from "@/app/queries/profile";
import { HistoryHeader } from "@/components/HistoryNew/HistoryHeader";

import chompGraphicImage from "../../public/images/chomp-graphic.png";
import History from "../HistoryNew/History";

interface RevealDeckProps {
  deckId: number;
  deckTitle: string;
  deckDescription: string | null;
  deckFooter: string | null;
  numberOfQuestions: number;
  deckImage?: string;
}

const RevealDeck = async ({
  deckId,
  deckTitle,
  deckDescription,
  deckFooter,
  numberOfQuestions,
  deckImage = chompGraphicImage.src,
}: RevealDeckProps) => {
  return (
    <div className="pt-4 flex flex-col gap-4 overflow-hidden w-full max-w-lg mx-auto px-4">
      <BackButton text="Deck" />
      <HistoryHeader
        deckId={deckId}
        deckTitle={deckTitle}
        deckDescription={deckDescription}
        deckFooter={deckFooter}
        numberOfQuestions={numberOfQuestions}
        deckImage={deckImage}
      />
      <hr className="border-gray-600 my-0 p-0" />

      <History deckId={deckId} deckTitle={deckTitle} />
    </div>
  );
};

export default RevealDeck;
