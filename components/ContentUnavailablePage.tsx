"use client";

import ErrorBoundary from "@/app/components/ErrorBoundary/ErrorBoundary";
import { satoshi } from "@/lib/fonts";

import { UserThreatLevelDetected } from "../lib/error";

export default async function ContentUnavailablePage() {
  const err = new UserThreatLevelDetected("User threat level detected");
  return (
    <html lang="en" className={`${satoshi.variable} h-full`}>
      <body className="bg-gray-900 text-white h-full">
        <ErrorBoundary error={err} reset={() => {}} />;
      </body>
    </html>
  );
}
