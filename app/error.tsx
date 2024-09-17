"use client";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="bg-gray-950 h-[100%]">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  );
}
