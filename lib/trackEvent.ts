const trackEvent = async (
  eventName: string,
  eventProperties?: Record<string, any>,
) => {
  const additionalProperties = {
    $current_url: window.location.href,
    $hostname: window.location.hostname,
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

  try {
    await fetch("/api/mixpanel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: eventName,
        properties: properties,
      }),
    });
  } catch (e) {
    console.error("Unable to track event", e);
  }
};

export default trackEvent;
