"use client";

import { cn } from "@/app/utils/tailwind";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  userId?: string;
};

const Main = ({ children, className, userId }: Props) => {
  const pathname = usePathname();
  return (
    <main
      className={cn(
        "flex-grow overflow-y-auto w-full max-w-lg mx-auto flex flex-col pt-12 overflow-x-hidden",
        {
          "px-4": !pathname.endsWith("application"),
          //"pt-0": !userId,
        },
        className,
      )}
    >
      {children}
    </main>
  );
};

export default Main;
