import { ReactNode } from "react";
import "react-datepicker/dist/react-datepicker.css";

import { AdminTabNavigation } from "../components/AdminTabNavigation/AdminTabNavigation";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 overflow-y-auto h-[90%]">
        {children}
      </main>
      <AdminTabNavigation />
      <AuthRedirect />
    </div>
  );
}
