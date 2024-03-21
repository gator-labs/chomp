import { ReactNode } from "react";
import { TabNavigation } from "../TabNavigation/TabNavigation";
import { Navbar } from "../Navbar/Navbar";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <Navbar avatarSrc="" avatarLink="" walletLink="" />
      <main className="flex-grow">{children}</main>
      <TabNavigation />
    </div>
  );
}
