import { ReactNode } from "react";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { CollapsedContextProvider } from "../providers/CollapsedProvider";
import ConfettiProvider from "../providers/ConfettiProvider";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <CollapsedContextProvider>
      <ConfettiProvider>
        <div className="flex flex-col h-full">
          <main className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col">
            {children}
          </main>
          <TabNavigation />
          <AuthRedirect />
          <DailyDeckRedirect />
        </div>
      </ConfettiProvider>
    </CollapsedContextProvider>
  );
}
