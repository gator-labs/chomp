"use client";

import ErrorBoundary from "@/app/components/ErrorBoundary/ErrorBoundary";
import { satoshi } from "@/lib/fonts";

import { UserThreatLevelDetected } from "../lib/error";

type ContentUnavailablePageProps = {
  cause?: {};
};

export default function ContentUnavailablePage({
  cause,
}: ContentUnavailablePageProps) {
  const err = new UserThreatLevelDetected("User threat level detected", {
    cause: { ...cause, via: "CUP" },
  });
  return (
    <html lang="en" className={`${satoshi.variable} h-full`}>
      <body className="bg-gray-900 text-white h-full">
        <ErrorBoundary error={err} reset={() => {}} />;
      </body>
    </html>
  );
}
