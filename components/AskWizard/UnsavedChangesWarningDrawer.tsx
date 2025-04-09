import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";

type UnsavedChangedsWarningDrawerProps = {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

const UnsavedChangedsWarningDrawer = ({
  isOpen,
  onKeepEditing,
  onDiscard,
}: UnsavedChangedsWarningDrawerProps) => {
  return (
    <Drawer open={isOpen}>
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <Dialog>
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-destructive font-bold">
                Unsaved changes
              </p>
            </div>
          </DialogTitle>
        </Dialog>
        <p className="text-sm mb-6">
          You're about to leave this page. All changes will be discarded if you
          leave.
        </p>

        <p className="text-sm mb-6">Would you like to keep editing?</p>

        <Button
          onClick={onKeepEditing}
          className="h-[50px] mt-2 font-bold"
          variant="primary"
        >
          Keep Editing
        </Button>

        <Button
          onClick={onDiscard}
          className="h-[50px] mt-2 font-bold"
          variant="destructive"
        >
          Discard
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default UnsavedChangedsWarningDrawer;
