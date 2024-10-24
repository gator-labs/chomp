"use client";

import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams}`;

  // Use a ref to store the previous URL
  const prevUrlRef = useRef(url);

  useEffect(() => {
    const trackPageView = async () => {
      const prevUrl = prevUrlRef.current;

      if (prevUrl !== url) {
        // URL has changed, track the event
        await trackEvent(TRACKING_EVENTS.PAGE_VIEW, {
          [TRACKING_METADATA.URL_PATH]: pathname,
          [TRACKING_METADATA.URL_SEARCH]: Object.fromEntries(
            searchParams.entries(),
          ),
        });
      }

      // Update the ref with the current URL
      prevUrlRef.current = url;
    };

    trackPageView();
  }, [url, pathname, searchParams]);

  return null;
}

export default TrackPageView;
