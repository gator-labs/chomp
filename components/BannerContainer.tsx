"use client";

import { getActiveBanner, updateLastSeenBanner } from "@/app/queries/banner";
import { Banner as BannerType } from "@prisma/client";
import { useEffect, useState } from "react";

import { Banner } from "./Banner";

export function BannerContainer() {
  const [banner, setBanner] = useState<BannerType | null>(null);

  useEffect(() => {
    (async () => {
      const activeBanner = await getActiveBanner();
      setBanner(activeBanner);
    })();
  }, []);

  const handleDismiss = async () => {
    if (!banner) return;

    await updateLastSeenBanner(banner.id);
    setBanner(null);
  };

  if (!banner) return null;

  return (
    <Banner
      url={banner.url}
      iconUrl={banner.image}
      text={banner.text}
      onDismiss={handleDismiss}
    />
  );
}
