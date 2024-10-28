"use client";

import { Children, ReactNode } from "react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

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

  return (
    <div className={className}>
      <div className="mb-2 px-4">{title}</div>
      <Swiper spaceBetween={8} className="w-full !px-4">
        {content}
      </Swiper>
    </div>
  );
}
