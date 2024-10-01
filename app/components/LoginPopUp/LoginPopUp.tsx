"use client";

import { setJwt } from "@/app/actions/jwt";
import LoadingScreen from "@/app/screens/LoginScreens/LoadingScreen";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { RedirectType, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type LoginPopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  deckId: number;
};

const LoginPopUp = ({ isOpen, onClose, userId, deckId }: LoginPopUpProps) => {
  const { authToken, awaitingSignatureState } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(localStorage.getItem("selectedDeckId")) {
      localStorage.removeItem("selectedDeckId");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (authToken) setJwt(authToken);

    if (
      !!userId &&
      !!authToken &&
      awaitingSignatureState === "idle" &&
      !localStorage.getItem("selectedDeckId")
    ) {
      setIsLoading(false);
    }
    if (
      !!userId &&
      !!authToken &&
      awaitingSignatureState === "idle" &&
      localStorage.getItem("selectedDeckId")
    ) {
      const selectedDeckId = localStorage.getItem("selectedDeckId");
      localStorage.removeItem("selectedDeckId");
      redirect(`/application/decks/${selectedDeckId}`, RedirectType.push);
    }

    if (!userId && !authToken && awaitingSignatureState === "idle") {
      setIsLoading(false);
    }
  }, [authToken, userId, awaitingSignatureState]);

  if (isLoading) return <LoadingScreen />;

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
        <div className="flex justify-between items-center mb-6">
          <p className="text-base text-secondary font-bold">
            Login to view deck
          </p>
          <div onClick={onClose}>
            <CloseIcon />
          </div>
        </div>
        <p className="text-sm mb-6">
          Connect your wallet to answer questions and win prizes!
        </p>

        <div
          onClick={() => localStorage.setItem("selectedDeckId", `${deckId}`)}
          className="w-full"
        >
          <DynamicConnectButton
            buttonContainerClassName="w-full"
            buttonClassName="bg-purple-500 text-white rounded-lg inline-flex justify-center py-3 px-16 rounded-md font-bold text-base w-full text-sm font-semibold flex [&>*]:flex [&>*]:items-center [&>*]:gap-1 h-[50px] justify-center items-center"
          >
            Connect Wallet
          </DynamicConnectButton>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="h-[50px] mt-2 font-bold"
        >
          Close
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default LoginPopUp;
