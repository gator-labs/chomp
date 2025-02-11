import ContentUnavailablePage from "@/components/ContentUnavailablePage";
import { UserThreatLevelDetected } from "@/lib/error";
import { satoshi } from "@/lib/fonts";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import "react-spring-bottom-sheet/dist/style.css";

import LinkProgressBar from "./components/LinkProgressBar/LinkProgressBar";
import MobileChromeDetector from "./components/MobileChromeDetector/MobileChromeDetector";
import TrackPageView from "./components/TrackPageView/TrackPageView";
import { ClaimProvider } from "./providers/ClaimProvider";
import DynamicProvider from "./providers/DynamicProvider";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { RevealContextProvider } from "./providers/RevealProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { getCurrentUser } from "./queries/user";
import { getBonkBalance, getSolBalance } from "./utils/solana";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.ENVIRONMENT === "demo";

  let user;
  try {
    user = await getCurrentUser();
  } catch (e) {
    if ((e as Error)?.name == "UserThreatLevelDetected")
      return (
        <ContentUnavailablePage
          cause={(e as UserThreatLevelDetected)?.cause as {}}
        />
      );
    else throw e;
  }

  const address = user?.wallets?.[0]?.address || "";

  const [bonkBalance, solBalance] = await Promise.all([
    getBonkBalance(address),
    getSolBalance(address),
  ]);

  return (
    <html lang="en" className={`${satoshi.variable} h-full`}>
      <body className="bg-gray-900 text-white h-full">
        {isDemo && (
          <div className="fixed top-0 left-[50%] -translate-x-1/2 text-sm px-3 py-1 font-semibold bg-primary text-gray-900 rounded-b-lg">
            Demo mode
          </div>
        )}
        <LinkProgressBar />
        <ReactQueryProvider>
          <DynamicProvider>
            <ToastProvider>
              <ClaimProvider>
                <RevealContextProvider
                  bonkBalance={bonkBalance}
                  solBalance={solBalance}
                >
                  <MobileChromeDetector>{children}</MobileChromeDetector>
                </RevealContextProvider>
              </ClaimProvider>
            </ToastProvider>
          </DynamicProvider>
        </ReactQueryProvider>
        <Analytics />
        <TrackPageView />
      </body>
    </html>
  );
}
