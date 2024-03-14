import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DynamicProvider from "./providers/DynamicProvider";
import { AuthRedirect } from "./components/AuthRedirect/AuthRedirect";

import "@/styles/global.css";

const inter = Inter({ subsets: ["latin"], variable: "--inter" });

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
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <DynamicProvider>
          {children}
          <AuthRedirect />
        </DynamicProvider>
      </body>
    </html>
  );
}
