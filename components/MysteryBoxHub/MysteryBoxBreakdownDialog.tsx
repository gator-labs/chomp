"use client";

import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import Spinner from "@/app/components/Spinner/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { formatCompactAmount } from "@/app/utils/number";
import { useMysteryBoxBreakdown } from "@/hooks/useMysteryBoxBreakdown";
import { MysteryBox, MysteryBoxBreakdown } from "@/types/mysteryBox";
import Link from "next/link";

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
  const breakdown = useMysteryBoxBreakdown(isOpen ? box.id : undefined);

  const openDate = box.openedAt ? new Date(box.openedAt) : null;

  const boxBreakdown = breakdown?.data?.breakdown ?? [];

  const hasValidDeckBreakdown = boxBreakdown && boxBreakdown.length > 0;

  const answeredDeckCard = (deck: MysteryBoxBreakdown) => {
    const revealedDate = deck.revealedOn ? new Date(deck.revealedOn) : null;

    return (
      <Link href={`/application/decks/${deck.id}`} key={deck.id}>
        <div className="bg-gray-600 rounded-lg px-4 py-3 flex flex-col gap-3 cursor-pointer hover:bg-gray-700">
          <div className="flex justify-between items-center">
            <span className="max-w-[15rem] md:max-w-[20rem]">
              <h4 className="font-black text-xs line-clamp-1">{deck.name}</h4>
            </span>
            <ChevronRightIcon className="text-gray-400" />
          </div>
          <div className="flex justify-between">
            <div className="text-purple-100 text-xs">
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
              <div className="text-purple-100 text-xs text-right">
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
      </Link>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4 bg-[#202020] border-0 data-[state=open]:rounded-2xl w-[90%] sm:w-[100%]">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-base">
            Claimed Mystery Box
          </DialogTitle>
        </DialogHeader>

        {/* Summary Section */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between bg-gray-700 rounded-xl p-4">
            <div className="flex flex-col text-purple-300 text-base font-medium gap-1">
              <div>
                Total Credits{" "}
                <span className="font-black text-secondary">
                  {formatCompactAmount(box.creditsReceived)}
                </span>
              </div>
              <div>
                Total BONK{" "}
                <span className="font-black text-secondary">
                  {formatCompactAmount(box.bonkReceived)}
                </span>
              </div>
            </div>
            {openDate && (
              <div className="flex flex-col text-purple-300 text-base text-right font-medium gap-1">
                <div>Opened on</div>
                <div>
                  <span>
                    {openDate.toLocaleString("en-US", { month: "short" })}{" "}
                    {openDate.getDate()}
                  </span>{" "}
                  {openDate.getFullYear()}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-700"></div>

          {/* Answered Decks Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-xs font-black">Answered Decks</h3>
            <div className="max-h-[200px] overflow-y-auto">
              {breakdown.isLoading ? (
                <div className="bg-gray-700 rounded-xl pt-1 pb-4 text-gray-400 text-center">
                  <Spinner />
                </div>
              ) : breakdown.isError ? (
                <div className="bg-gray-700 rounded-xl p-4 text-gray-400 text-center">
                  <p className="text-xs">
                    Unable to load mystery box breakdown.
                  </p>
                </div>
              ) : hasValidDeckBreakdown ? (
                <div className="flex flex-col gap-3">
                  {boxBreakdown!.map(answeredDeckCard)}
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
            <div className="text-xs">Box Type:</div>
            <MysteryBoxCategoryPill category={box.category} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MysteryBoxBreakdownDialog;
