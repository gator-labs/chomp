import type { Metadata, Viewport } from "next";
import classNames from "classnames";

import DynamicProvider from "./providers/DynamicProvider";

import "@/styles/globals.css";
import { sora } from "@/lib/fonts";

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
  return (
    <html lang="en" className={classNames(sora.variable, "h-full")}>
      <body className="font-sora bg-[#0D0D0D] text-white h-full">
        <DynamicProvider>{children}</DynamicProvider>
      </body>
    </html>
  );
}
