import { TRACKING_METADATA } from "@/app/constants/tracking";
import { getCurrentUser } from "@/app/queries/user";
import { kv } from "@/lib/kv";
import Mixpanel from "mixpanel";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { NextRequest, NextResponse, userAgent } from "next/server";

const mixpanel = Mixpanel.init(process.env.MIX_PANEL_TOKEN!);

interface UtmData {
  initial_utm?: Record<string, string>;
  last_utm?: Record<string, string>;
}

function getIPAddress(headersList: ReadonlyHeaders) {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headersList.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const currentUser = await getCurrentUser();
    const { event, properties } = data;
    const ip = getIPAddress(request.headers);
    const { device, browser, os } = userAgent({ headers: request.headers });

    if (!currentUser) {
      mixpanel.track(event, {
        ...properties,
        $device: device.model,
        $browser: browser.name,
        $os: os.name,
        $os_version: os.version,
        $browser_version: browser.version,
        ip,
      });
    } else {
      const utmParams = {
        utm_source: properties.$utm_source,
        utm_medium: properties.$utm_medium,
        utm_campaign: properties.$utm_campaign,
        utm_term: properties.$utm_term,
        utm_content: properties.$utm_content,
      };

      const { ...propertiesWithoutUtm } = properties;

      // Get stored UTM data from KV
      const storedUtmData = (await kv.get(
        `utm:${currentUser.id}`,
      )) as UtmData | null;
      let initialUtm = storedUtmData?.initial_utm || {};
      let lastUtm = storedUtmData?.last_utm || {};

      // Check if any new UTM parameters are provided
      const hasNewUtmParams = Object.values(utmParams).some(
        (value) => value !== undefined,
      );

      const utmParamsWithoutUndefined = Object.fromEntries(
        Object.entries(utmParams).filter(([value]) => value !== undefined),
      );

      // Update initial and last UTM data
      if (!storedUtmData || hasNewUtmParams) {
        initialUtm =
          Object.keys(initialUtm).length > 0
            ? initialUtm
            : utmParamsWithoutUndefined;
        lastUtm = hasNewUtmParams ? utmParamsWithoutUndefined : lastUtm;

        // Remove undefined values
        Object.keys(lastUtm).forEach(
          (key) => lastUtm[key] === undefined && delete lastUtm[key],
        );

        // Store updated UTM data in KV
        await kv.set(`utm:${currentUser.id}`, {
          initial_utm: initialUtm,
          last_utm: lastUtm,
        });
      }

      mixpanel.track(event, {
        ...propertiesWithoutUtm,
        $device: device.model,
        $browser: browser.name,
        $os: os.name,
        $os_version: os.version,
        $browser_version: browser.version,
        [TRACKING_METADATA.USER_ID]: currentUser.id,
        [TRACKING_METADATA.USERNAME]: currentUser.username,
        [TRACKING_METADATA.USER_WALLET_ADDRESS]: currentUser.wallets[0].address,
        initial_utm_source: initialUtm.utm_source,
        initial_utm_medium: initialUtm.utm_medium,
        initial_utm_campaign: initialUtm.utm_campaign,
        initial_utm_term: initialUtm.utm_term,
        initial_utm_content: initialUtm.utm_content,
        last_utm_source: lastUtm.utm_source,
        last_utm_medium: lastUtm.utm_medium,
        last_utm_campaign: lastUtm.utm_campaign,
        last_utm_term: lastUtm.utm_term,
        last_utm_content: lastUtm.utm_content,
        ip,
      });
    }

    return NextResponse.json({ status: "Event tracked successfully" });
  } catch (error) {
    console.error("[Mixpanel]", error);
    return NextResponse.json({ status: "Internal Server Error" });
  }
}
