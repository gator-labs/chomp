import { Modal } from "@/app/components/Modal/Modal";
import { Button } from "@/app/components/ui/button";
import { getRevealedAtString } from "@/app/utils/dateUtils";
import gatorHeadImage from "@/public/images/gator-head.png";
import Image from "next/image";
import React, { useState } from "react";

import ImagePreviewIcon from "../icons/ImagePreviewIcon";
import QuestionIcon from "../icons/QuestionIcon";

type QuestionPreviewCardProps = {
  question: string;
  revealAtDate?: Date | null;
  imageUrl: string | null;
};

function QuestionPreviewCard({
  question,
  revealAtDate,
  imageUrl,
}: QuestionPreviewCardProps) {
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-row items-center gap-2 my-4">
        <QuestionIcon width={24} height={24} />
        <p className="text-lg">Question</p>
      </div>

      <div className="relative  bg-purple-500 w-full h-full min-h-[155px] pt-5 pb-3 px-5 rounded-xl flex flex-col justify-between">
        <div className="text-xl text-white mb-4 font-bold">{question}</div>
        <Image
          src={gatorHeadImage}
          alt="gator-head"
          className="absolute bottom-0 w-[241px] h-[93px]z-10"
        />
        <div className="flex flex-row items-center justify-between">
          {revealAtDate && (
            <span className="text-xs font-bold text-purple-200">
              {getRevealedAtString(revealAtDate)}{" "}
            </span>
          )}

          {imageUrl && (
            <>
              <Button
                className="bg-purple-300 max-w-fit p-4 rounded-full text-xs font-bold"
                onClick={() => setIsViewImageOpen(true)}
              >
                View Image
                <ImagePreviewIcon width={18} height={18} />
              </Button>

              <Modal
                isOpen={isViewImageOpen}
                onClose={() => setIsViewImageOpen(false)}
                title=""
                variant="image-only"
              >
                <img alt="preview-image" src={imageUrl} />
              </Modal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPreviewCard;
