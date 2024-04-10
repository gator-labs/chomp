import { ReactNode } from "react";

import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { Navbar } from "@/app/components/Navbar/Navbar";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink=""
      />
      {children}
    </>
  );
}
