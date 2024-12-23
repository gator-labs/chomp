import {
  TRACKING_EVENTS,
} from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";

type CreditsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreditsDrawer = ({
  isOpen,
  onClose,
}: CreditsDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.MYSTERY_BOX_CREDITS_INFO_DIALOG_OPENED);
    }
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
          trackEvent(TRACKING_EVENTS.MYSTERY_BOX_CREDITS_INFO_DIALOG_CLOSED);
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">
              Credits? What could this be? 🤔
            </p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>

        <p className="text-sm mb-6">
          Chompy has the best answer for this (like they do with any question,
          of course), but it's not the right time to tell you yet 😉.
        </p>

        <p className="text-sm mb-6">
          Guess you better CHOMP around and find out 🐊
        </p>

        <Button onClick={onClose} className="h-[50px] mt-2 font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default CreditsDrawer;
