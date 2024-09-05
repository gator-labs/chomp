import { NextRequest, NextResponse } from "next/server";

import { MIX_PANEL_METADATA } from "@/app/constants/mixpanel";
import { getCurrentUser } from "@/app/queries/user";
import Mixpanel from "mixpanel";

const mixpanel = Mixpanel.init(process.env.MIX_PANEL_TOKEN!);

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const currentUser = await getCurrentUser();
  
    const { event, properties } = data;

    if (!currentUser) {
      mixpanel.track(event, {
        ...properties,
        ip: request.ip,
      });
    } else {
      mixpanel.track(event, {
        ...properties,
        [MIX_PANEL_METADATA.USER_ID]: currentUser.id,
        [MIX_PANEL_METADATA.USERNAME]: currentUser.username,
        [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]:
          currentUser.wallets[0].address,
        ip: request.ip,
      });
    }
    return NextResponse.json({ status: "Event tracked successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
