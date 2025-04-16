import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

import { AnswerRewards } from "./AnswerRewards";

type UnderstandYourResultsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const UnderstandYourResultsDrawer = ({
  isOpen,
  onClose,
}: UnderstandYourResultsDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.UNDERSTAND_YOUR_RESULTS_DIALOG_OPENED);
    }
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
          trackEvent(TRACKING_EVENTS.UNDERSTAND_YOUR_RESULTS_DIALOG_CLOSED);
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <Dialog>
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-secondary font-bold">
                Understanding Your Results
              </p>
              <div onClick={onClose}>
                <CloseIcon width={16} height={16} />
              </div>
            </div>
          </DialogTitle>
        </Dialog>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Validation Questions</h2>
            <AnswerRewards
              bonkReward={"100000"}
              creditsReward={"10"}
              isPracticeQuestion={false}
              isCorrect={true}
              variant="outline"
            />
            <p className="text-sm font-medium">
              <span className="text-green font-bold">Green</span> &mdash;
              Correct answer in Validation Deck (earned some or all rewards).
            </p>
            <AnswerRewards
              bonkReward={"0"}
              creditsReward={"0"}
              isPracticeQuestion={false}
              isCorrect={false}
              variant="outline"
            />
            <p className="text-sm font-medium">
              <span className="text-chomp-red-light font-bold">Red</span>{" "}
              &mdash; Incorrect answer in Validation Deck (no rewards).
            </p>
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <h2 className="text-xl font-bold">Practice Questions</h2>
            <AnswerRewards
              bonkReward={"0"}
              creditsReward={"0"}
              isPracticeQuestion={true}
              isCorrect={true}
              variant="outline"
            />
            <AnswerRewards
              bonkReward={"0"}
              creditsReward={"0"}
              isPracticeQuestion={true}
              isCorrect={false}
              variant="outline"
            />
            <p className="text-sm font-medium">
              <span className="text-chomp-gold-light font-bold">Yellow</span>{" "}
              &mdash; Practice Deck Results (✅ or ❌ icon shows if you were
              right, but no rewards).
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="h-[50px] mt-2 font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default UnderstandYourResultsDrawer;
