import classNames from "classnames";
import { CSSProperties } from "react";

type AvatarProps = {
  src: string;
  size: "extrasmall" | "small" | "medium" | "large";
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
      default:
        return 0;
    }
  };

  return (
    <img
      src={src}
      alt="Avatar"
      width={resolveDimensions()}
      height={resolveDimensions()}
      className={classNames("rounded-full border-2 border-white", className)}
      style={style}
    />
  );
}
