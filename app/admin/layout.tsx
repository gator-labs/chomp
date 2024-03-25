import { ReactNode } from "react";
import { AdminTabNavigation } from "../components/AdminTabNavigation/AdminTabNavigation";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow w-full max-w-7xl mx-auto p-4">{children}</main>
      <AdminTabNavigation />
    </div>
  );
}
