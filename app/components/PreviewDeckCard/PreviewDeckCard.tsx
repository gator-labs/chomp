import { cn } from "@/app/utils/tailwind";
import Image from "next/image";
import gatorHeadImage from "../../../public/images/gator-head.png";

type PreviewDeckCardProps = {
  className?: string;
  heading: string;
  description: string | null;
  footer: string | null;
  imageUrl: string | null;
  totalNumberOfQuestions: number;
  campaignImage: string;
};

const PreviewDeckCard = ({
  className,
  heading,
  description,
  footer,
  campaignImage,
  imageUrl,
  totalNumberOfQuestions,
}: PreviewDeckCardProps) => {
  return (
    <div
      className={cn(
        "h-[350px] w-full max-w-[480px] py-6 px-4 bg-gray-700 rounded-lg relative flex flex-col justify-between overflow-scroll",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <h1 className="text-purple-200 font-medium text-[24px]">{heading}</h1>
        {!!description && <p className="text-[14px]">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {(imageUrl || campaignImage) && (
          <div className="relative w-[77px] h-[77px]">
            <Image
              src={imageUrl || campaignImage} // use imageUrl first, fallback to campaignImage
              alt=""
              fill
              objectFit="cover"
              className="rounded-full overflow-hidden"
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!!footer && <p className="text-[14px]">{footer}</p>}
          <p className="text-[14px]">
            Total {totalNumberOfQuestions} card
            {totalNumberOfQuestions > 1 && "s"}
          </p>
        </div>
      </div>

      <Image
        src={gatorHeadImage}
        alt="gator-head"
        className="absolute bottom-0 left-0 w-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};

export default PreviewDeckCard;
