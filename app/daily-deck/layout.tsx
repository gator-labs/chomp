import { ReactNode } from "react";

type PageLayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow overflow-y-auto mb-2 h-full w-full max-w-lg mx-auto">
        {children}
      </main>
    </div>
  );
}
