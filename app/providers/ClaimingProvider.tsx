"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

interface ClaimingContextType {
  isClaiming: boolean;
  setIsClaiming: React.Dispatch<React.SetStateAction<boolean>>;
}

const ClaimingContext = createContext<ClaimingContextType | undefined>(
  undefined,
);

const ClaimingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  return (
    <ClaimingContext.Provider value={{ isClaiming, setIsClaiming }}>
      {children}
    </ClaimingContext.Provider>
  );
};

const useClaiming = () => {
  const context = useContext(ClaimingContext);
  if (context === undefined) {
    throw new Error("useClaiming must be used within a ClaimingProvider");
  }
  return context;
};

export { ClaimingProvider, useClaiming };
