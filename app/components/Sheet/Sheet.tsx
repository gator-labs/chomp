"use client";

import { BottomSheet } from "react-spring-bottom-sheet";
import { Button } from "../Button/Button";
import { CloseIcon } from "../Icons/CloseIcon";

interface SheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closIconWidth?: number;
  closIconHeight?: number;
}

const Sheet = ({
  children,
  isOpen,
  setIsOpen,
  closIconHeight,
  closIconWidth,
}: SheetProps) => {
  return (
    <BottomSheet
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false);
      }}
      className="relative"
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
        }}
        className="absolute top-5 right-6 border-none w-max !p-0 z-50"
      >
        <CloseIcon width={closIconWidth} height={closIconHeight} />
      </Button>
      {children}
    </BottomSheet>
  );
};

export default Sheet;
