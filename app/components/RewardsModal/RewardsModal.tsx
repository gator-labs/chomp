import { toPng } from "html-to-image";
import Image from "next/image";
import { useRef } from "react";
import { Modal } from "../Modal/Modal";

type RewardsModalProps = {
  isModalOpen: boolean;
  onClose: () => void;
  claimableAmount?: number;
  revealedQuestions?: number;
  correctQuestions?: number;
  avatarImg: string;
};

const RewardsModal = ({
  isModalOpen,
  onClose,
  claimableAmount,
  revealedQuestions,
  correctQuestions,
  avatarImg,
}: RewardsModalProps) => {
  const imgRef = useRef<HTMLDivElement | null>(null);

  const htmlToImageConvert = () => {
    toPng(imgRef.current!, { cacheBust: false })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-rewards.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Modal title="" isOpen={isModalOpen} onClose={onClose}>
      <div className="flex flex-col">
        <div
          className="bg-[#F3F2EC] rounded-[12px] p-4 flex flex-col gap-3"
          ref={imgRef}
        >
          <div className="p-2 bg-primary rounded-[12px] flex gap-4 items-center">
            <Image
              src={avatarImg}
              alt="Avatar"
              width={72}
              height={72}
              className="rounded-full border-2 border-purple-100 object-cover object-center"
              style={{
                width: 72,
                height: 72,
              }}
            />

            <div>
              <p className="text-[16px] leading-5 font-bold text-purple-200">
                I just won
              </p>
              <p className="text-[16px] leading-5 font-bold text-purple-200">
                <span className="text-white">
                  {Math.round(claimableAmount || 0).toLocaleString("en-US")}{" "}
                  BONK
                </span>{" "}
                from playing Chomp
              </p>
            </div>
          </div>
          <div className="p-2 bg-secondary rounded-[12px] flex gap-2 flex-col">
            <div className="flex-1 p-5 rounded-[12px] bg-[#D6FCF4] flex justify-center items-center gap-2 text-center">
              <p className="text-[40px] leading-[40px] text-[#0C5546] font-black">
                {revealedQuestions}
              </p>
              <p className="text-[24px] leading-[24px] text-[#68C6B2] font-black">
                questions answered
              </p>
            </div>
            <div className="flex-1 p-5 rounded-[12px] bg-[#FBF3BA] flex justify-center items-center gap-2 text-center">
              <p className="text-[40px] leading-[40px] text-[#6C6219] font-black">
                {correctQuestions}
              </p>
              <p className="text-[24px] leading-[24px] text-[#CCBF64] font-black">
                correct answers
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex p-5 bg-primary rounded-[12px]">
              <p className="text-[16px] leading-5 font-bold text-purple-200">
                Stop FOMOing and join the party. Flex your intelligence and win
                $BONK at <span className="text-white">app.chomp.games</span>
              </p>
            </div>
          </div>
        </div>
        <button onClick={htmlToImageConvert} className="mt-2">
          Download Image
        </button>
      </div>
    </Modal>
  );
};

export default RewardsModal;
