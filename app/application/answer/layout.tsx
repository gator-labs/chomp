import { ReactNode } from "react";

import { Navbar } from "@/app/components/Navbar/Navbar";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink="/application/transactions"
      />
      {children}
    </>
  );
}
