import { ReactNode } from "react";
import { TabNavigation } from "../TabNavigation/TabNavigation";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <header>header</header>
      <main className="flex-grow">{children}</main>
      <TabNavigation />
    </div>
  );
}
