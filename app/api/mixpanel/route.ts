import { NextRequest, NextResponse, userAgent } from "next/server";
import { TRACKING_METADATA } from "@/app/constants/tracking";
import { getCurrentUser } from "@/app/queries/user";
import { kv } from "@/lib/kv";
import Mixpanel from "mixpanel";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";

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

async function handleUtmParams(userId: string, properties: any) {
  const utmParams = {
    utm_source: properties.$utm_source,
    utm_medium: properties.$utm_medium,
    utm_campaign: properties.$utm_campaign,
    utm_term: properties.$utm_term,
    utm_content: properties.$utm_content,
  };

  // Get stored UTM data from KV
  const storedUtmData = await kv.get(`utm:${userId}`) as UtmData | null;
  let initialUtm = storedUtmData?.initial_utm || {};
  let lastUtm = storedUtmData?.last_utm || {};

  // Check if any new UTM parameters are provided
  const hasNewUtmParams = Object.values(utmParams).some(
    (value) => value !== undefined,
  );

  const utmParamsWithoutUndefined = Object.fromEntries(
    Object.entries(utmParams).filter(([_, value]) => value !== undefined)
  );

  // Update initial and last UTM data
  if (!storedUtmData || hasNewUtmParams) {
    initialUtm = Object.keys(initialUtm).length > 0 ? initialUtm : utmParamsWithoutUndefined;
    lastUtm = hasNewUtmParams ? utmParamsWithoutUndefined : lastUtm;

    // Remove undefined values
    Object.keys(lastUtm).forEach(
      (key) => lastUtm[key] === undefined && delete lastUtm[key],
    );

    // Store updated UTM data in KV
    await kv.set(`utm:${userId}`, {
      initial_utm: initialUtm,
      last_utm: lastUtm,
    });
  }

  return { initialUtm, lastUtm };
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const currentUser = await getCurrentUser();
    const { event, properties } = data;
    const ip = getIPAddress(request.headers);
    const { device, browser, os } = userAgent({ headers: request.headers });

    // Get device ID from cookie or create a new one
    let deviceId = cookies().get('device_id')?.value;
    if (!deviceId) {
      deviceId = uuidv4();
    }

    // Set the device ID cookie
    cookies().set('device_id', deviceId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365 // 1 YEAR
    });

    // General device properties which entitles both pre-login and post-login users
    const deviceProperties = {
      $device_id: deviceId,
      $device: device.model,
      $browser: browser.name,
      $os: os.name,
      $os_version: os.version,
      $browser_version: browser.version,
      ip,
    };

    if (!currentUser) {
      // Pre-login user tracking
      const { initialUtm, lastUtm } = await handleUtmParams(deviceId, properties);

      mixpanel.track(event, {
        ...properties,
        ...deviceProperties,
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
      });
    } else {
      // Post-login user tracking
      const { initialUtm, lastUtm } = await handleUtmParams(currentUser.id, properties);

      const {
        $utm_source,
        $utm_medium,
        $utm_campaign,
        $utm_term,
        $utm_content,
        ...propertiesWithoutUtm
      } = properties;

      mixpanel.track(event, {
        ...propertiesWithoutUtm,
        ...deviceProperties,
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
      });
    }

    return NextResponse.json({ status: "Event tracked successfully" });
  } catch (error) {
    console.error("[Mixpanel]", error);
    return NextResponse.json({ status: "Internal Server Error" });
  }
}
