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
  stackImage: string;
};

const PreviewDeckCard = ({
  className,
  heading,
  description,
  footer,
  stackImage,
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
        {(imageUrl || stackImage) && (
          <div className="relative w-[77px] h-[77px]">
            <Image
              src={imageUrl || stackImage} // use imageUrl first, fallback to stackImage
              alt=""
              fill
              className="rounded-full overflow-hidden"
              sizes="(max-width: 600px) 50px, (min-width: 601px) 77px"
              style={{ objectFit: "cover" }}
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
        sizes="480px"
        priority
      />
    </div>
  );
};

export default PreviewDeckCard;
