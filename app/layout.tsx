import type { Metadata, Viewport } from "next";
import DynamicProvider from "./providers/DynamicProvider";

import { satoshi } from "@/lib/fonts";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import "react-spring-bottom-sheet/dist/style.css";
import LinkProgressBar from "./components/LinkProgressBar/LinkProgressBar";
import MobileChromeDetector from "./components/MobileChromeDetector/MobileChromeDetector";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { ToastProvider } from "./providers/ToastProvider";

export const viewport: Viewport = {
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
  themeColor: [{ color: "#fff" }],
};

export const metadata: Metadata = {
  title: "Chomp",
  description:
    "Chomp is a quiz game that leverages social consensus to get you the best answers to questions! Play, burn, and earn on Chomp today!",
  generator: "Next.js",
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-128x128.png" },
    { rel: "icon", url: "/icons/icon-128x128.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.ENVIRONMENT === "demo";

  return (
    <html lang="en" className={`${satoshi.variable} h-full`}>
      <body className="bg-gray-950 text-white h-full">
        {isDemo && (
          <div className="fixed top-0 left-[50%] -translate-x-1/2 text-sm px-3 py-1 font-semibold bg-primary text-gray-950 rounded-b-lg">
            Demo mode
          </div>
        )}
        <LinkProgressBar />
        <ReactQueryProvider>
          <DynamicProvider>
            <ToastProvider>
              <MobileChromeDetector>{children}</MobileChromeDetector>
            </ToastProvider>
          </DynamicProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
