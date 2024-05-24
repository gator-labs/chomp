"use client";

import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import { WalletIcon } from "@/app/components/Icons/WalletIcon";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { useState } from "react";
import { SLIDESHOW } from "./constants";

const SlideshowScreen = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { width } = useWindowSize();

  const isLastSlideActive = SLIDESHOW.length - 1 === activeSlide;
  const isFirstSlideActive = activeSlide === 0;

  return (
    <main className="h-dvh bg-[#1B1B1B]">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 justify-between h-full">
        <ul className="py-10 flex gap-2 w-full px-1 pb-0">
          {SLIDESHOW.map((step, index) => (
            <li
              key={step.title}
              className="h-2 flex-1 rounded-[40px] bg-[#666666] overflow-hidden"
            >
              <div
                className={classNames(
                  "bg-[#CFC5F7] w-0 h-full transition-all duration-300 ease-out",
                  index <= activeSlide && "w-full",
                )}
              />
            </li>
          ))}
        </ul>
        <div className="relative w-full flex [&>*]:w-full">
          {SLIDESHOW[activeSlide].icon}
        </div>
        <div className="flex flex-col gap-8 items-center text-[20px] leading-6">
          <h3 className="text-center">{SLIDESHOW[activeSlide].title}</h3>

          <div className="flex gap-[10px] items-center w-full justify-between">
            <div
              className="relative"
              onClick={() => {
                if (isFirstSlideActive) return;
                setActiveSlide((curr) => curr - 1);
              }}
            >
              <HalfArrowLeftIcon
                fill={isFirstSlideActive ? "#666666" : "#fff"}
                width={width > 768 ? 32 : 24}
                height={width > 768 ? 32 : 24}
              />
            </div>
            <div>
              <p className="text-sm text-center">
                {SLIDESHOW[activeSlide].description}
              </p>
            </div>
            <div
              className="relative shrink-0"
              onClick={() => {
                if (isLastSlideActive) return;
                setActiveSlide((curr) => curr + 1);
              }}
            >
              <HalfArrowRightIcon
                fill={isLastSlideActive ? "#666666" : "#fff"}
                width={width > 768 ? 32 : 24}
                height={width > 768 ? 32 : 24}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] items-center w-full py-4">
          <DynamicConnectButton
            buttonContainerClassName="w-full"
            buttonClassName="bg-[#A3A3EC] text-btn-text-primary rounded-lg inline-flex justify-center py-3 px-16 rounded-2xl font-bold text-base w-full text-sm font-semibold flex [&>*]:flex [&>*]:items-center [&>*]:gap-1"
          >
            Connect Wallet
            <WalletIcon fill="#0D0D0D" />
          </DynamicConnectButton>
        </div>
      </div>
    </main>
  );
};

export default SlideshowScreen;
