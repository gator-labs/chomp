import type { Metadata } from "next";
import classNames from "classnames";

import DynamicProvider from "./providers/DynamicProvider";

import "@/styles/globals.css";
import { sora } from "@/lib/fonts";
import { AuthRedirect } from "./components/AuthRedirect/AuthRedirect";

export const metadata: Metadata = {
  title: "Chomp",
  description: "Gator Chomp app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={classNames(sora.variable, "h-full")}>
      <body className="font-sora bg-[#0D0D0D] text-white h-full">
        <DynamicProvider>
          {children}
          <AuthRedirect />
        </DynamicProvider>
      </body>
    </html>
  );
}
