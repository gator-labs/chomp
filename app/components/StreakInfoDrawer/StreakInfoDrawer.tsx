import { DialogTitle } from "@radix-ui/react-dialog";
import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type StreakInfoDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const StreakInfoDrawer = ({ isOpen, onClose }: StreakInfoDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">Streak</p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>
        <p className="text-sm mb-6">
          Keep going! Streaks track consecutive days you&apos;ve answered or
          revealed. How long can you keep it up?
        </p>

        <Button onClick={onClose} className="h-[50px] mt-2 font-bold">
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default StreakInfoDrawer;
