import Image from "next/image";

import { ChompyGuitarIcon } from "../Icons/ChompyGuitarIcon";
import HeadIcon from "../Icons/HeadIcon";

type ClaimPreviewImageProps = {
  questionsAnswered: number;
  correctAnswers: number;
  profileImg: string;
  claimedAmount: number;
};

const ClaimPreviewImage = ({
  questionsAnswered,
  correctAnswers,
  profileImg,
  claimedAmount,
}: ClaimPreviewImageProps) => {
  return (
    <div className="p-3 bg-white mb-6 rounded-[8px] flex flex-col gap-2">
      <div className="p-2 rounded-[8px] bg-primary relative gap-2 flex">
        <Image
          src={profileImg}
          width={40}
          height={40}
          alt="profile"
          className="rounded-full border-[2px] border-purple-100"
        />

        <div className="w-5 h-5 absolute top-1 right-1 bg-white rounded flex justify-center items-center">
          <HeadIcon />
        </div>

        <div className="font-black text-[14px] leading-[18px] tracking-tight text-secondary">
          <p>I just won</p>
          <p>
            <span className="text-white">
              {claimedAmount.toLocaleString("en-US")} BONK
            </span>{" "}
            from playing Chomp
          </p>
        </div>
      </div>
      <div className="p-1 rounded-[8px] bg-secondary flex gap-1">
        <div className="flex-1 rounded-[8px] flex bg-[#D6FCF4] items-center px-1 gap-1 justify-center">
          <p className="text-[50.44px] leading-[68px] text-[#0C5546] font-black">
            {questionsAnswered}
          </p>
          <p className="text-[#68C6B2] text-[17.27px] leading-[17px] tracking-tight font-black w-[77px]">
            questions answered
          </p>
        </div>
        <div className="flex-1 rounded-[8px] flex bg-[#FBF3BA] items-center px-1 gap-1 justify-center">
          <p className="text-[50.44px] leading-[68px] text-[#6C6219] font-black">
            {correctAnswers}
          </p>
          <p className="text-[#CCBF64] text-[17.27px] leading-[17px] tracking-tight font-black w-[63px]">
            correct answers
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="p-3 bg-primary rounded-[8px] flex-1 relative">
          <div
            className="bg-primary absolute top-[10px] right-0 translate-x-full"
            style={{
              clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
              width: "5.76px",
              height: "5.18px",
            }}
          />
          <p className="font-black text-secondary text-[13.49px] leading-[18.21px] tracking-tight">
            Stop FOMOing and join the party. Flex your intelligence and win
            $BONK at <span className="text-white">app.chomp.games</span>
          </p>
        </div>
        <ChompyGuitarIcon width={78} height={70} />
      </div>
    </div>
  );
};

export default ClaimPreviewImage;
