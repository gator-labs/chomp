import { v4 } from "uuid";

const sendToMixpanel = async (
  eventName: string,
  eventProperties?: Record<string, any>,
) => {
  const additionalProperties = {
    distinct_id: v4(),
    $browser: navigator.userAgent,
    $current_url: window.location.href,
    $device_id: navigator.userAgent,
    $initial_referrer: document.referrer ? document.referrer : undefined,
    $initial_referring_domain: document.referrer
      ? new URL(document.referrer).hostname
      : undefined,
    $screen_height: window.screen.height,
    $screen_width: window.screen.width,
  };
  const properties = {
    ...eventProperties,
    ...additionalProperties,
  };

  fetch("/api/mixpanel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: eventName,
      properties: properties,
    }),
  });
};

export default sendToMixpanel;
