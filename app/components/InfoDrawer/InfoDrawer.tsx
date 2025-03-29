import { Dialog, DialogTitle } from "@radix-ui/react-dialog";

import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type InfoDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const InfoDrawer = ({ isOpen, onClose, title, children }: InfoDrawerProps) => {
  return (
    <Drawer open={isOpen}>
      <DrawerContent className="p-6 flex flex-col">
        <Dialog>
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-secondary font-bold">{title}</p>
              <div onClick={onClose} className="cursor-pointer">
                <CloseIcon width={16} height={16} />
              </div>
            </div>
          </DialogTitle>
        </Dialog>
        {children}

        <Button onClick={onClose} className="h-[50px] font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default InfoDrawer;
