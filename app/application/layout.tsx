import { ReactNode } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import AvatarPlaceholder from "../../public/images/avatar_placeholder.png";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <Navbar avatarSrc={AvatarPlaceholder.src} avatarLink="" walletLink="" />
      <main className="flex-grow">{children}</main>
      <TabNavigation />
    </div>
  );
}
