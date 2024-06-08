import classNames from "classnames";
import type { Metadata, Viewport } from "next";
import DynamicProvider from "./providers/DynamicProvider";

import { sora } from "@chomp/lib/fonts";
import "@chomp/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import "react-spring-bottom-sheet/dist/style.css";
import MobileChromeDetector from "./components/MobileChromeDetector/MobileChromeDetector";
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
  description: "Chomp description",
  generator: "Next.js",
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
    { rel: "icon", url: "icons/icon-128x128.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.ENVIRONMENT === "demo";

  return (
    <html lang="en" className={classNames(sora.variable, "h-full")}>
      <body className="font-sora bg-[#0D0D0D] text-white h-full">
        {isDemo && (
          <div className="fixed top-0 left-[50%] -translate-x-1/2 text-sm px-3 py-1 font-semibold bg-primary text-btn-text-primary rounded-b-lg">
            Demo mode
          </div>
        )}
        <DynamicProvider>
          <ToastProvider>
            <MobileChromeDetector>{children}</MobileChromeDetector>
          </ToastProvider>
        </DynamicProvider>
        <Analytics />
      </body>
    </html>
  );
}
