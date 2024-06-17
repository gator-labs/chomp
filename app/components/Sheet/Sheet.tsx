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
  disableClose?: boolean;
}

const Sheet = ({
  children,
  isOpen,
  setIsOpen,
  closIconHeight,
  closIconWidth,
  disableClose = false,
}: SheetProps) => {
  if (!isOpen) return null;

  return (
    <BottomSheet
      open={isOpen}
      onDismiss={() => {
        if (!disableClose) setIsOpen(false);
      }}
      className="relative [&>*]:!z-[999] [&>div:first-child]:!z-[9]"
    >
      <Button
        onClick={(e) => {
          if (!disableClose) {
            e.stopPropagation();
            setIsOpen(false);
          }
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
