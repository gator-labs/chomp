import { Children, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

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
    <SwiperSlide key={index}>{item}</SwiperSlide>
  ));

  return (
    <div className={className}>
      <div className="mb-1.5">{title}</div>
      <Swiper slidesPerView={1.05} spaceBetween={8}>
        {content}
      </Swiper>
    </div>
  );
}
