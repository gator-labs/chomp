import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type MysteryBoxProps = {
  isOpen: boolean;
  closeBoxDialog: () => void;
};

function MysteyBox({ isOpen, closeBoxDialog }: MysteryBoxProps) {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          closeBoxDialog();
        }
      }}
    >
      <DrawerContent className="p-6 px-4 flex flex-col">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">Myster Box</p>
            <div onClick={closeBoxDialog}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>
        <Button variant={"primary"}>Open Box</Button>
      </DrawerContent>
    </Drawer>
  );
}

export default MysteyBox;
