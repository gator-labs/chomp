import { getNewHistoryHeaderData } from "@/app/actions/history";
import BackButton from "@/app/components/BackButton/BackButton";
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
  const indicators = await getNewHistoryHeaderData(deckId);

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
        indicators={indicators}
      />
      <hr className="border-gray-600 my-0 p-0" />

      <History deckId={deckId} />
    </div>
  );
};

export default RevealDeck;
