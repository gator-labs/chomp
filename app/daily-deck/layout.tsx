import { ReactNode } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import AvatarPlaceholder from "../../public/images/avatar_placeholder.png";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <Navbar avatarSrc={AvatarPlaceholder.src} avatarLink="" walletLink="" />
      <main className="flex-grow overflow-y-auto mb-2 h-full w-full max-w-lg mx-auto">
        {children}
      </main>
    </div>
  );
}
