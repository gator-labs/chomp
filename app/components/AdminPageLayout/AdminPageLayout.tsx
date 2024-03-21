import { ReactNode } from "react";
import { AdminTabNavigation } from "../AdminTabNavigation/AdminTabNavigation";

type AdminPageLayoutProps = {
  children: ReactNode;
};

export function AdminPageLayout({ children }: AdminPageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <AdminTabNavigation />
      <main>{children}</main>
    </div>
  );
}
