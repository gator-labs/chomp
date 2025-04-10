import { Button } from "@/app/components/ui/button";
import { Drawer, DrawerContent } from "@/app/components/ui/drawer";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";

type ImageUploadErrorDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ImageUploadErrorDrawer = ({
  isOpen,
  onClose,
}: ImageUploadErrorDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DrawerContent className="p-6 flex flex-col z-index z-[999]">
        <Dialog>
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-destructive font-bold">
                Image upload error
              </p>
            </div>
          </DialogTitle>
        </Dialog>
        <p className="text-sm mb-6">Image must be smaller than 5MB.</p>

        <Button
          onClick={onClose}
          className="h-[50px] mt-2 font-bold"
          variant="outline"
        >
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default ImageUploadErrorDrawer;
