"use client";

import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { MysteryBox, MysteryBoxDeckBreakdown } from "@/types/mysteryBox";
import { useRouter } from "next-nprogress-bar";

import MysteryBoxCategoryPill from "./MysteryBoxCategoryPill";

interface MysteryBoxBreakdownDialogProps {
  box: MysteryBox;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mystery Box Rewards Breakdown Dialog
 */
function MysteryBoxBreakdownDialog({
  box,
  isOpen,
  onClose,
}: MysteryBoxBreakdownDialogProps) {
  const router = useRouter();
  const openDate = box.openedAt ? new Date(box.openedAt) : null;

  const totalCredits = Number(box.creditsReceived).toLocaleString("en-US");
  const totalBonk = Number(box.bonkReceived).toLocaleString("en-US");

  const hasValidDeckBreakdown =
    box.deckBreakdown && box.deckBreakdown.length > 0;

  const handleDeckClick = (deckId: number) => {
    router.push(`/application/decks/${deckId}`);
    onClose();
  };

  const answeredDeckCard = (deck: MysteryBoxDeckBreakdown) => {
    const revealedDate = deck.revealedOn ? new Date(deck.revealedOn) : null;

    return (
      <div
        key={deck.id}
        className="bg-gray-600 rounded-lg px-4 py-3 flex flex-col gap-1 cursor-pointer hover:bg-gray-700"
        onClick={() => handleDeckClick(deck.id)}
      >
        <div className="flex justify-between items-center">
          <span className="max-w-[15rem] md:max-w-[20rem]">
            <h4 className="font-medium text-sm line-clamp-1">{deck.name}</h4>
          </span>
          <ChevronRightIcon className="text-gray-400" />
        </div>
        <div className="flex justify-between">
          <div className="text-purple-100 text-sm">
            <div>
              Credits{" "}
              <span className="font-bold">
                {deck.creditsReceived.toLocaleString("en-US")}
              </span>
            </div>
            <div>
              BONK{" "}
              <span className="font-bold">
                {deck.bonkReceived.toLocaleString("en-US")}
              </span>
            </div>
          </div>
          {revealedDate && (
            <div className="text-purple-100 text-sm text-right">
              <div>Revealed on</div>
              <div>
                <span className="font-bold">
                  {revealedDate.toLocaleString("en-US", {
                    month: "short",
                    timeZone: "UTC",
                  })}{" "}
                  {revealedDate.getUTCDate()}
                </span>{" "}
                {revealedDate.getUTCFullYear()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-4 bg-[#202020] border-0 data-[state=open]:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-medium">
            Claimed Mystery Box
          </DialogTitle>
        </DialogHeader>

        {/* Summary Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between bg-gray-700 rounded-xl p-4">
            <div className="flex flex-col text-purple-300 text-sm">
              <div>
                Total Credits{" "}
                <span className="font-bold text-secondary">{totalCredits}</span>
              </div>
              <div>
                Total BONK{" "}
                <span className="font-bold text-secondary">{totalBonk}</span>
              </div>
            </div>
            {openDate && (
              <div className="text-purple-300 text-sm text-right">
                <div>Opened on</div>
                <div>
                  <span className="font-bold">
                    {openDate.toLocaleString("en-US", { month: "short" })}{" "}
                    {openDate.getDate()}
                  </span>{" "}
                  {openDate.getFullYear()}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-600"></div>

          {/* Answered Decks Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-sm">Answered Decks</h3>
            <div className="max-h-[200px] overflow-y-auto">
              {hasValidDeckBreakdown ? (
                <div className="flex flex-col gap-3">
                  {box.deckBreakdown!.map(answeredDeckCard)}
                </div>
              ) : (
                <div className="bg-gray-700 rounded-xl p-4 text-gray-400 text-center">
                  <p className="text-xs">
                    This may be a special reward not associated with a specific
                    deck.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Box Type Section */}
          <div className="flex items-center gap-2">
            <div className="text-sm">Box Type:</div>
            <MysteryBoxCategoryPill category={box.category} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MysteryBoxBreakdownDialog;
