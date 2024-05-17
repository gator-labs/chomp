"use client";

import { BottomSheet } from "react-spring-bottom-sheet";

interface RevealSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const RevealSheet = ({ children, isOpen, setIsOpen }: RevealSheetProps) => {
  return (
    <BottomSheet
      open={isOpen}
      onDismiss={() => {
        setIsOpen(false);
      }}
    >
      {children}
    </BottomSheet>
  );
};

export default RevealSheet;
