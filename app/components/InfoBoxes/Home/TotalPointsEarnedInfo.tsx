"use client";
import { useState } from "react";
import Sheet from "../../Sheet/Sheet";

interface TotalPointsEarnedInfoProps {
  children: React.ReactNode;
}

const TotalPointsEarnedInfo = ({ children }: TotalPointsEarnedInfoProps) => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsInfoSheetOpen(true);
      }}
      className="cursor-pointer"
    >
      <div className="col-span-1">{children}</div>
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-secondary text-base font-bold  text-left">
              Total Points Earned
            </h3>
            <p className="text-left flex flex-col gap-4">
              <p className="text-sm font-light  text-left">
                Your points are rewarded based on both{" "}
                <span className="font-bold">quantity</span> and{" "}
                <span className="font-bold">quality</span> of your contribution
                to Chomp.
              </p>
              <p className="text-sm font-light  text-left">
                When you perform the following actions on Chomp, you will earn a
                correlating amount of points:
              </p>
              <ul className="text-sm font-light  text-left bulleted-list">
                <li>
                  A question you ask gets vetted and accepted:&nbsp;{" "}
                  <span className="text-secondary font-bold">69</span> points
                </li>
                <li>
                  Answer a full deck:&nbsp;
                  <span className="text-secondary font-bold">20</span>
                  &nbsp;points
                </li>
                <li>
                  Answer a question:&nbsp;
                  <span className="text-secondary font-bold">10</span>
                  &nbsp;points
                </li>
                <li>
                  Reveal an answer:&nbsp;
                  <span className="text-secondary font-bold">42</span>
                  &nbsp;points
                </li>
                <li>
                  Get 1st order question exactly right:&nbsp;
                  <span className="text-secondary font-bold">6.9</span>
                  &nbsp;points
                </li>
                <li>
                  Get 2nd order question exactly right:&nbsp;
                  <span className="text-secondary font-bold">15</span>
                  &nbsp;points
                </li>
              </ul>
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default TotalPointsEarnedInfo;
