import { ReactNode } from "react";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col">
        {children}
      </main>
      <TabNavigation />
      <AuthRedirect />
      <DailyDeckRedirect />
    </div>
  );
}
