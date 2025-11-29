"use client";

import { cn } from "@/app/utils/tailwind";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  userId?: string;
};

const Main = ({ children, className }: Props) => {
  return (
    <main
      className={cn(
        "flex-grow overflow-y-auto w-full max-w-lg mx-auto flex flex-col overflow-x-hidden",
        className,
      )}
    >
      {children}
    </main>
  );
};

export default Main;
