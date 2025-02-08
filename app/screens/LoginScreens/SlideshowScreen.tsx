"use client";

import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import { WalletIcon } from "@/app/components/Icons/WalletIcon";
import Stepper from "@/app/components/Stepper/Stepper";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";

import { SLIDESHOW } from "./constants";

const SlideshowScreen = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const isLastSlideActive = SLIDESHOW.length - 1 === activeSlide;
  const isFirstSlideActive = activeSlide === 0;

  return (
    <main className="h-dvh bg-gray-800">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 justify-between h-full">
        <Stepper activeStep={activeSlide} numberOfSteps={SLIDESHOW.length} />

        <div className="relative w-full flex [&>*]:w-full">
          {SLIDESHOW[activeSlide].icon}
        </div>
        <div className="flex flex-col gap-8 items-center ">
          <h3 className="text-center text-xl leading-6 font-bold">
            {SLIDESHOW[activeSlide].title}
          </h3>

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
              />
            </div>
            <div>
              <p className="text-sm text-center flex flex-col gap-5">
                {SLIDESHOW[activeSlide].description.map((text) => (
                  <span key={text}>{text}</span>
                ))}
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
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] items-center w-full py-4">
          <DynamicConnectButton
            buttonContainerClassName="w-full"
            buttonClassName="w-full flex bg-purple-500 text-white items-center justify-center py-3 px-16 rounded-lg text-sm font-semibold"
          >
            <span className="flex items-center gap-1">
              Connect Wallet
              <WalletIcon fill="#FFFFFF" />
            </span>
          </DynamicConnectButton>
        </div>
      </div>
    </main>
  );
};

export default SlideshowScreen;
