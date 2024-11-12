import { getDeckTotalClaimableRewards } from "@/app/actions/history";
import { getAllDeckQuestionsReadyForReveal } from "@/app/queries/history";
import { getProfileImage } from "@/app/queries/profile";
import Image from "next/image";

import chompGraphicImage from "../../../public/images/chomp-graphic.png";
import BackButton from "../BackButton/BackButton";
import History from "../History/History";
import HistoryHeader from "../HistoryHeader/HistoryHeader";

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
  const [revealableQuestions, totalClaimableRewards, profileImg] =
    await Promise.all([
      getAllDeckQuestionsReadyForReveal(deckId),
      getDeckTotalClaimableRewards(deckId),
      getProfileImage(),
    ]);
  return (
    <div className="pt-4 flex flex-col gap-8 overflow-hidden w-full max-w-lg mx-auto px-4">
      <BackButton />
      <div className="p-4 bg-gray-850 flex gap-4">
        <div>
          <div className="relative w-[100.5px] h-[100.5px]">
            <Image
              src={deckImage}
              fill
              alt={deckTitle}
              className="object-cover"
              sizes="(max-width: 600px) 80px, (min-width: 601px) 100.5px"
              priority
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base mb-3">{deckTitle}</h1>
          <p className="text-xs mb-6">
            {deckDescription ? `${deckDescription}, ` : ""}
          </p>
          <p>{deckFooter ? `${deckFooter}, ` : ""}</p>
          <p>{numberOfQuestions} cards</p>
        </div>
      </div>
      <HistoryHeader
        revealableQuestions={revealableQuestions}
        profileImg={profileImg}
        totalClaimableRewards={totalClaimableRewards}
      />
      <History deckId={deckId} />
    </div>
  );
};

export default RevealDeck;
