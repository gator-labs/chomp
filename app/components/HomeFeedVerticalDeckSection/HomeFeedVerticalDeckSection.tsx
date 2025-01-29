import React from "react";

import { HomeFeedVerticalCarousel } from "../HomeFeedVerticalCarousel/HomeFeedVerticalCarousel";

async function HomeFeedVerticalDeckSection() {
  return (
    <HomeFeedVerticalCarousel
      className="mt-8  px-4"
      title={<span className="text-lg">Share Opinions</span>}
    />
  );
}

export default HomeFeedVerticalDeckSection;
