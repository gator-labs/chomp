"use client";

import { cn } from "@/app/utils/tailwind";
import { Banner } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";

interface Props {
  banners: Banner[];
  className?: string;
}

const BannerSlider = ({ banners, className }: Props) => {
  const sliderContent = (banner: Banner) => (
    <img src={banner.image} className="w-full h-full" />
  );

  return (
    <div>
      <Swiper className="w-full !overflow-visible" spaceBetween={8}>
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            style={{ background: banner.backgroundColor }}
            className={cn("rounded-3xl mb-4", className)}
          >
            {banner.url ? (
              <a
                href={banner.url}
                target="_blank"
                className="flex gap-4 items-center"
              >
                {sliderContent(banner)}
              </a>
            ) : (
              <div className="flex gap-4 items-center">
                {sliderContent(banner)}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
