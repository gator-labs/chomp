"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// avoid using useRouter in the global error boundaries as they don't have nextjs context.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html>
      <body className="bg-gray-950 h-[100%]">
        <ErrorBoundary error={error} reset={reset} />
      </body>
    </html>
  );
}
