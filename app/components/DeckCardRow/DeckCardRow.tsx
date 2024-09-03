import { getRevealAtText } from "@/app/utils/history";
import Link from "next/link";
import { ClockIcon } from "../Icons/ClockIcon";
import { DeckIcon } from "../Icons/DeckIcon";
import LeadToIcon from "../Icons/LeadToIcon";

type DeckProps = {
  deckId: number;
  image: string | null;
  revealAtDate: Date | null;
  deckName: string;
  numberOfQuestionsInDeck: number;
  answeredQuestions: number;
  claimedQuestions: number;
  revealedQuestions: number;
  claimableQuestions: number;
  claimedAmount: number | null;
};

const DeckCardRow = ({
  deckName,
  deckId,
  revealAtDate,
  numberOfQuestionsInDeck,
  answeredQuestions,
  revealedQuestions,
  claimableQuestions,
}: DeckProps) => {
  const revealMessage = revealAtDate ? getRevealAtText(revealAtDate) : "";

  let statusLabel = "null";

  if (numberOfQuestionsInDeck === answeredQuestions) statusLabel = "Chomped";
  if (
    numberOfQuestionsInDeck === answeredQuestions &&
    revealedQuestions < answeredQuestions
  )
    statusLabel = "Not revealed";
  if (revealedQuestions === answeredQuestions && claimableQuestions > 1)
    statusLabel = "Revealed";

  return (
    <Link
      href={`/application/decks/${deckId}`}
      className="bg-grey-800 border-[0.5px] border-grey-600 rounded-lg p-4 py-[15px] flex gap-4 h-full"
    >
      <DeckIcon width={77.2} height={87.84} />

      <div className="flex flex-col gap-y-2 w-full justify-between">
        <div className="flex flex-col gap-y-2 w-full">
          <div className="flex gap-2 w-full justify-between">
            <p className="text-grey-0 font-sora font-semibold text-sm">
              {deckName}
            </p>

            <div>
              <LeadToIcon width={16} height={13} />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex text-xs text-grey-0 leading-6 items-center gap-1">
            <ClockIcon />
            <div>
              {!!revealMessage && (
                <span className="text-xs font-light">{revealMessage}</span>
              )}
            </div>
          </div>
          <p className="text-xs text-aqua">{statusLabel}</p>
        </div>
      </div>
    </Link>
  );
};

export default DeckCardRow;
