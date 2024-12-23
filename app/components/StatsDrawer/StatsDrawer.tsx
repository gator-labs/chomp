import {
  HOME_STAT_CARD_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type StatsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: keyof typeof HOME_STAT_CARD_TYPE;
};

const StatsDrawer = ({
  isOpen,
  onClose,
  title,
  description,
  type,
}: StatsDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.HOME_STAT_CARD_DIALOG_OPENED, {
        [TRACKING_METADATA.TYPE]: type,
      });
    }
  }, [isOpen]);

  const descriptionSections = description.split("\n").map((section, index) => {
    return (
      <p key={index} className="text-sm mb-6">
        {section}
      </p>
    );
  });

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
          trackEvent(TRACKING_EVENTS.HOME_STAT_CARD_DIALOG_CLOSED, {
            [TRACKING_METADATA.TYPE]: type,
          });
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">{title}</p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>
        {descriptionSections}

        <Button onClick={onClose} className="h-[50px] mt-2 font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default StatsDrawer;
