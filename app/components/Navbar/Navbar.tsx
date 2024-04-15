import Link from "next/link";
import { ReactNode } from "react";
import { Avatar } from "../Avatar/Avatar";
import { WalletIcon } from "../Icons/WalletIcon";

type NavbarProps = {
  children?: ReactNode;
  avatarSrc: string;
  walletLink: string;
  avatarLink: string;
};

export function Navbar({
  children,
  avatarSrc,
  walletLink,
  avatarLink,
}: NavbarProps) {
  return (
    <nav className="bg-btn-text-primary flex justify-between w-full px-4 py-3 items-center">
      <div>{children}</div>
      <div className="flex gap-2 items-center">
        <Link href={walletLink}>
          <WalletIcon />
        </Link>
        <Link href={avatarLink}>
          <Avatar src={avatarSrc} size="small" />
        </Link>
      </div>
    </nav>
  );
}
