import { NextRequest, NextResponse, userAgent } from "next/server";

import { TRACKING_METADATA } from "@/app/constants/tracking";
import { getCurrentUser } from "@/app/queries/user";
import Mixpanel from "mixpanel";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

const mixpanel = Mixpanel.init(process.env.MIX_PANEL_TOKEN!);

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
      mixpanel.track(event, {
        ...properties,
        $device: device.model,
        $browser: browser.name,
        $os: os.name,
        $os_version: os.version,
        $browser_version: browser.version,
        [TRACKING_METADATA.USER_ID]: currentUser.id,
        [TRACKING_METADATA.USERNAME]: currentUser.username,
        [TRACKING_METADATA.USER_WALLET_ADDRESS]: currentUser.wallets[0].address,
        ip,
      });
    }

    return NextResponse.json({ status: "Event tracked successfully" });
  } catch (error) {
    console.log("[Mixpanel]", error);
    return NextResponse.json({ status: "Internal Server Error" });
  }
}
