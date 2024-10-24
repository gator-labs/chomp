"use client";

import Link from "next/link";
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
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-pink text-base font-bold  text-left">
              Viewing Best Answers
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-sm font-light  text-left">
                Under-the-hood, Chomp has adapted empirical researched
                &quot;Wisdom of the Crowd&quot; mechanisms to distill signal
                from noise, and infer the most-likely-right answer (or &quot;the
                best answer&quot;) from collective user inputs.
              </p>
              <p className="text-sm font-bold  text-left">
                For more information about how Chomp&apos;s mechanism works,
                please read on in{" "}
                <Link
                  href="https://chomp.gitbook.io/chomp/"
                  target="_blank"
                  className="underline"
                >
                  Chomp&apos;s Docs
                </Link>
                .
              </p>
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default TopInfoBox;
