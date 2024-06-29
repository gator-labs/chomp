"use client";

import { BottomSheet } from "react-spring-bottom-sheet";
import { Button } from "../Button/Button";
import { CloseIcon } from "../Icons/CloseIcon";

interface SheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
  closeIconWidth?: number;
  closeIconHeight?: number;
  disableClose?: boolean;
}

const Sheet = ({
  children,
  isOpen,
  setIsOpen,
  closeIconHeight,
  closeIconWidth,
  disableClose = false,
}: SheetProps) => {
  return (
    <BottomSheet
      open={isOpen}
      onDismiss={() => {
        if (!disableClose && setIsOpen) setIsOpen(false);
      }}
      className="relative [&>*]:!z-[999] [&>div:first-child]:!z-[9]"
    >
      <Button
        onClick={(e) => {
          if (!disableClose && setIsOpen) {
            e.stopPropagation();
            setIsOpen(false);
          }
        }}
        className="absolute top-5 right-6 border-none w-max !p-0 z-50"
      >
        <CloseIcon width={closeIconWidth} height={closeIconHeight} />
      </Button>
      {children}
    </BottomSheet>
  );
};

export default Sheet;
