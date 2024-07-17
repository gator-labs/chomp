"use client";

import { cn } from "@/app/utils/tailwind";
import { Banner } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import LeadToIcon from "../Icons/LeadToIcon";

interface Props {
  banners: Banner[];
  className?: string;
}

const BannerSlider = ({ banners, className }: Props) => {
  const sliderContent = (banner: Banner) => (
    <>
      <img src={banner.image} width={98} height={145} />
      <div className="flex flex-col gap-2">
        <p className="text-[24px] leading-[27.6px] text-[#1B1B1B] font-extrabold">
          {banner.title}
        </p>
        <div className="flex gap-4 items-end">
          <p className="text-sm text-[#1B1B1B]">{banner.description}</p>
          {!!banner.url && (
            <div className="relative">
              <LeadToIcon fill="#333333" />
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div>
      <Swiper className="w-full !overflow-visible" spaceBetween={8}>
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            style={{ background: banner.backgroundColor }}
            className={cn("p-4 rounded-3xl mb-4", className)}
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
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            style={{ background: banner.backgroundColor }}
            className={cn("p-4 rounded-3xl mb-4", className)}
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
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            style={{ background: banner.backgroundColor }}
            className={cn("p-4 rounded-3xl mb-4", className)}
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
