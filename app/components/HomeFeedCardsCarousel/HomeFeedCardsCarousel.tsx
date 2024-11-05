"use client";

import { ProviderEnum } from "@dynamic-labs/sdk-api-core";
import { useSocialAccounts } from "@dynamic-labs/sdk-react-core";
import { Children, ReactNode } from "react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "../ui/button";

type HomeFeedCardsCarouselProps = {
  title: ReactNode;
  slides: ReactNode[];
  className?: string;
};

export function HomeFeedCardCarousel({
  title,
  slides,
  className,
}: HomeFeedCardsCarouselProps) {
  const content = Children.map(slides, (item, index) => (
    <SwiperSlide key={index} className="home-feed-swiper-slide">
      {item}
    </SwiperSlide>
  ));

  const { linkSocialAccount } = useSocialAccounts();

  return (
    <div className={className}>
      <div className="mb-2 px-4">{title}</div>
      <Swiper spaceBetween={8} className="w-full !px-4">
        {content}
      </Swiper>

      <Button
        onClick={async () => {
          linkSocialAccount(ProviderEnum.Telegram);
        }}
      >
        Click me to link telegram
      </Button>
    </div>
  );
}
