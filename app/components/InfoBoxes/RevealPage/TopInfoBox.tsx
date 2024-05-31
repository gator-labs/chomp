"use client";
import { useState } from "react";
import { InfoIcon } from "../../Icons/InfoIcon";
import Sheet from "../../Sheet/Sheet";

const TopInfoBox = () => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsInfoSheetOpen(true);
      }}
      className="cursor-pointer"
    >
      <InfoIcon height={24} width={24} fill="#fff" />
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closIconHeight={16}
        closIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-pink text-base font-bold leading-[20.16px] text-left">
              Viewing Best Answers
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                Under-the-hood, Chomp has adapted empirical researched
                &quot;Wisdom of the Crowd&quot; mechanisms to distill signal
                from noise, and infer the most-likely-right answer (or &quot;the
                best answer&quot;) from collective user inputs.
              </p>
              <p className="text-[13px] font-bold leading-[16.38px] text-left">
                For more information about how Chomp&apos;s mechanism works,
                please read on in Chomp&apos;s Docs
              </p>
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default TopInfoBox;
