"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function ErrorHandler() {
  const hasRefreshed = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const handleError = () => {
      console.log("🚒 Error detected");
      // Only refresh once
      if (!hasRefreshed.current) {
        console.log("🧯 Refreshing the page");
        hasRefreshed.current = true;
        router.refresh();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  return null;
}
