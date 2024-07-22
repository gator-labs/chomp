import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { ReactNode } from "react";

type PageLayoutProps = {
  children: ReactNode;
};
export default function Layout({ children }: PageLayoutProps) {
  return (
    <>
      <ProfileNavigation />
      {children}
    </>
  );
}
