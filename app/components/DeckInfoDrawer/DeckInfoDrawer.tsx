import { DialogTitle } from "@radix-ui/react-dialog";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type DeckInfoDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

const DeckInfoDrawer = ({
  isOpen,
  onClose,
  title,
  description,
}: DeckInfoDrawerProps) => {
  const descriptionSections = description.split("\n").map((section, index) => {
    return (
      <p key={index} className="text-sm mb-6 mt-0">
        {section}
      </p>
    );
  });

  return (
    <Drawer open={isOpen}>
      <DrawerContent className="p-6 flex flex-col">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">{title}</p>
            <div onClick={onClose} className="cursor-pointer">
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>
        {descriptionSections}

        <Button onClick={onClose} className="h-[50px] font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default DeckInfoDrawer;
