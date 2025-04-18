import { cn } from "@/lib/utils";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export type AskImagePreviewProps = {
  imageUrl?: string | null;
};

export function AskImagePreview({ imageUrl }: AskImagePreviewProps) {
  const [isImageShowing, setIsImageShowing] = useState<boolean>(false);

  const handleShowImage = () => {
    setIsImageShowing(true);
  };

  const handleHideImage = () => {
    setIsImageShowing(false);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape") setIsImageShowing(false);
  };

  useEffect(() => {
    if (isImageShowing) {
      document.addEventListener("keydown", handleKeyPress);
    } else {
      document.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isImageShowing]);

  return (
    <>
      <span
        className={cn(
          "bg-purple-300 rounded-full py-2 px-3 text-xs font-bold flex items-center gap-2",
          {
            "cursor-pointer": !!imageUrl,
            "text-purple-200 cursor-auto": !imageUrl,
          },
        )}
        onClick={imageUrl ? handleShowImage : undefined}
      >
        {imageUrl ? "View Image" : "No Image"}{" "}
        <ImageIcon size={22} color={imageUrl ? undefined : "#AFADEB"} />
      </span>
      {isImageShowing && imageUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex flex-col justify-center"
          onClick={handleHideImage}
        >
          <div className="flex flex-col max-h-full">
            <div className="flex justify-end px-2 py-1">
              <span className="cursor-pointer" onClick={handleHideImage}>
                <X size={28} />
              </span>
            </div>
            <div
              className="w-full mb-2 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                width={0}
                height={0}
                alt="preview-image"
                src={imageUrl}
                style={{ width: "100%", height: "auto", borderRadius: "1em" }}
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
