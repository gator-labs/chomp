import { ReactNode } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import AvatarPlaceholder from "../../public/images/avatar_placeholder.png";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink=""
      />
      <main className="flex-grow overflow-y-auto mb-2">{children}</main>
      <TabNavigation />
      <AuthRedirect />
      <DailyDeckRedirect />
    </div>
  );
}
