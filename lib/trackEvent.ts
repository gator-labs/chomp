const trackEvent = async (
  eventName: string,
  eventProperties?: Record<string, any>,
) => {
  const urlParams = new URLSearchParams(window.location.search);
  const additionalProperties = {
    $current_url: window.location.href,
    $initial_referrer: document.referrer ? document.referrer : undefined,
    $initial_referring_domain: document.referrer
      ? new URL(document.referrer).hostname
      : undefined,
    $screen_height: window.screen.height,
    $screen_width: window.screen.width,
    $utm_source: urlParams.get("utm_source") || undefined,
    $utm_medium: urlParams.get("utm_medium") || undefined,
    $utm_campaign: urlParams.get("utm_campaign") || undefined,
    $utm_term: urlParams.get("utm_term") || undefined,
    $utm_content: urlParams.get("utm_content") || undefined,
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

export default trackEvent;
