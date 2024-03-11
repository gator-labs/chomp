import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DynamicProvider from "./providers/DynamicProvider";
import { AuthRedirect } from "./components/AuthRedirect/AuthRedirect";
import "./global.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <DynamicProvider>
          {children}
          <AuthRedirect />
        </DynamicProvider>
      </body>
    </html>
  );
}
