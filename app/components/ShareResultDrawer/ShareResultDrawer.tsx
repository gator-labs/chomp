import { ReactNode } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import XIcon from "../Icons/XIcon";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "../ui/drawer";

type ShareResultDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageComponent: ReactNode;
};

const ShareResultDrawer = ({
  isOpen,
  onClose,
  title,
  description,
  imageComponent,
}: ShareResultDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DrawerContent className="py-6 px-4">
        <DrawerHeader className="p-0 mb-6">
          <div className="flex justify-between mb-6">
            <p className="text-base text-secondary font-bold">{title}</p>
            <CloseIcon />
          </div>
          <p className="text-sm font-medium text-left">{description}</p>
        </DrawerHeader>
        {imageComponent}
        <DrawerFooter className="p-5 flex-row justify-between items-center mt-6">
          <div className="w-10 h-10 bg-purple-200 rounded-full justify-center items-center flex">
            <DownloadIcon fill="#0D0D0D" />
          </div>
          <div className="w-10 h-10 bg-purple-200 rounded-full justify-center items-center flex">
            <XIcon fill="#0D0D0D" />
          </div>
          <div className="w-10 h-10 bg-purple-200 rounded-full justify-center items-center flex">
            <TelegramIcon width={24} height={24} fill="#0D0D0D" />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ShareResultDrawer;
