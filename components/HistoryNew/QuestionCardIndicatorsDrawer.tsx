import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { QuestionCorrectIcon } from "@/app/components/Icons/QuestionCorrectIcon";
import { QuestionIncorrectIcon } from "@/app/components/Icons/QuestionIncorrectIcon";
import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import { QuestionUnrevealedIcon } from "@/app/components/Icons/QuestionUnrevealedIcon";
import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

type QuestionCardIndicatorsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QuestionCardIndicatorsDrawer = ({
  isOpen,
  onClose,
}: QuestionCardIndicatorsDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.QUESTION_CARD_INDICATORS_INFO_DIALOG_OPENED);
    }
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
          trackEvent(
            TRACKING_EVENTS.QUESTION_CARD_INDICATORS_INFO_DIALOG_CLOSED,
          );
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">
              Question Card Indicators
            </p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>

        <div className="mx-2">
          <p className="text-xs mb-6 font-medium gap-3 items-center flex">
            <QuestionCorrectIcon /> You got this question right!
          </p>

          <p className="text-xs mb-6 font-medium gap-3 items-center flex">
            <QuestionIncorrectIcon /> You got this question wrong. 😔
          </p>

          <p className="text-xs mb-6 font-medium gap-3 items-center flex">
            <QuestionUnansweredIcon /> You didn&apos;t answer this question.
          </p>

          <p className="text-xs mb-6 font-medium gap-3 items-center flex">
            <QuestionUnrevealedIcon /> Answers will be revealed on the date
            shown on the card.
          </p>
        </div>

        <Button onClick={onClose} className="h-[50px] mt-2 font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default QuestionCardIndicatorsDrawer;
