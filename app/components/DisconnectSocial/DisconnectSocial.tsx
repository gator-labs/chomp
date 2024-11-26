import { DialogTitle } from "@radix-ui/react-dialog";
import React, { ReactNode, useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import DisconnectIcon from "../Icons/DisconnectIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type DisconnectSocialProps = {
  icon: ReactNode;
  username: string | undefined;
  disconnectHandler: () => void;
  socialName: string;
};

function DisconnectSocial({
  icon,
  username,
  disconnectHandler,
  socialName,
}: DisconnectSocialProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  return (
    <>
      <Button
        type="button"
        className="flex justify-between bg-gray-700 p-0 border-gray-500 border-2 hover:bg-gray-700"
      >
        <div className="bg-gray-600 w-[50px] rounded-l-md h-full flex justify-center items-center cursor-default">
          {icon}
        </div>
        <div className="w-full flex justify-start pl-2 cursor-default">
          @{username}
        </div>
        <div
          className="bg-gray-600 w-[50px] rounded-r-md h-full flex justify-center items-center cursor-pointer"
          onClick={() => {
            setIsDrawerOpen(true);
          }}
        >
          <DisconnectIcon width={24} height={24} />
        </div>
      </Button>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={async (open: boolean) => {
          if (!open) {
            closeDrawer();
          }
        }}
      >
        <DrawerContent className="p-6 px-4 flex flex-col">
          <DialogTitle>
            <div className="flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <p className="text-base text-secondary font-bold mb-4">
                  Unlink Account
                </p>
                <div onClick={closeDrawer}>
                  <CloseIcon width={16} height={16} />
                </div>
              </div>
              <p className="text-sm mb-4">
                Unlink {socialName} account from your profile?
              </p>
            </div>
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                disconnectHandler();
                closeDrawer();
              }}
            >
              Unlink
            </Button>
            <Button variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default DisconnectSocial;
