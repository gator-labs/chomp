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
};

const PreviewDeckCard = ({
  className,
  heading,
  description,
  footer,
  imageUrl,
  totalNumberOfQuestions,
}: PreviewDeckCardProps) => {
  return (
    <div
      className={cn(
        "w-full py-6 px-4 bg-gray-700 rounded-lg relative  min-h-[385px] flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-[20px]">
        <h1 className="text-[#8C96ED] font-medium text-[24px]">{heading}</h1>
        {!!description && <p className="text-[14px]">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {!!imageUrl && (
          <div className="relative w-[77px] h-[77px]">
            <Image
              src={imageUrl}
              alt=""
              fill
              objectFit="cover"
              className="rounded-lg overflow-hidden"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
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