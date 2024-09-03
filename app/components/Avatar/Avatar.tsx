import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import classNames from "classnames";
import Image from "next/image";
import { CSSProperties } from "react";

type AvatarProps = {
  src: string;
  size:
    | "extrasmall"
    | "small"
    | "medium"
    | "large"
    | "extralarge"
    | "oversized";
  className?: string;
  style?: CSSProperties;
};

export function Avatar({ src, size, className, style }: AvatarProps) {
  const resolveDimensions = () => {
    switch (size) {
      case "extrasmall":
        return 16;
      case "small":
        return 24;
      case "medium":
        return 40;
      case "large":
        return 64;
      case "extralarge":
        return 80;
      case "oversized":
        return 103;
      default:
        return 0;
    }
  };

  return (
    <Image
      src={src || AvatarPlaceholder}
      alt="Avatar"
      width={resolveDimensions()}
      height={resolveDimensions()}
      className={classNames(
        "rounded-full border-2 border-grey-0 object-cover object-center",
        className,
      )}
      style={{
        width: resolveDimensions(),
        height: resolveDimensions(),
        ...style,
      }}
    />
  );
}
