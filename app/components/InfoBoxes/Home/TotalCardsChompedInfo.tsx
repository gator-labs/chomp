"use client";
import { useState } from "react";
import Sheet from "../../Sheet/Sheet";

interface TotalCardChompedInfoProps {
  children: React.ReactNode;
}

const TotalCardChompedInfo = ({ children }: TotalCardChompedInfoProps) => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsInfoSheetOpen(true);
      }}
      className="cursor-pointer h-full"
    >
      <div className="col-span-1 h-full">{children}</div>
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-purple text-base font-bold leading-[20.16px] text-left">
              Total Cards Chomped
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                Just how hungry are you for a better information game?
              </p>
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                This stat measures how many{" "}
                <span className="text-purple font-bold">cards</span> (AKA
                questions) you&apos;ve chomped through since the launch of
                Chomp&apos;s beta.
              </p>
              <p className="text-[13px] font-light leading-[16.38px] text-left">
                Remember, the more you chomp, the more you could earn,{" "}
                <span className="font-semibold">and</span> the better
                high-signal information there is out on the internet!
              </p>
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default TotalCardChompedInfo;
