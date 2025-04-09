import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";

type ConfirmRemoveImageDrawerProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmRemoveImageDrawer = ({
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmRemoveImageDrawerProps) => {
  return (
    <Drawer open={isOpen}>
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <Dialog>
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-secondary font-bold">
                Remove image?
              </p>
            </div>
          </DialogTitle>
        </Dialog>
        <p className="text-sm mb-6">
          Are you sure you want to remove the image?
        </p>

        <Button
          onClick={onCancel}
          className="h-[50px] mt-2 font-bold"
          variant="primary"
        >
          Keep Image
        </Button>

        <Button
          onClick={onConfirm}
          className="h-[50px] mt-2 font-bold"
          variant="destructive"
        >
          Remove
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmRemoveImageDrawer;
