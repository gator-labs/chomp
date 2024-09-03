"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { useEffect } from "react";

const MobileChromeDetector = ({ children }: any) => {
  const { infoToast } = useToast();

  useEffect(() => {
    const userAgent = navigator.userAgent;

    const isMobile =
      /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent);
    const isChrome = /chrome|crios/i.test(userAgent);
    const isPhantom = /phantom/i.test(userAgent);

    if (isMobile && !isChrome && !isPhantom) {
      infoToast(
        "For best user experience with Dynamic login, please ensure you are using Chrome or Phantom browser.",
      );
    }
  }, []);

  return <>{children}</>;
};

export default MobileChromeDetector;
