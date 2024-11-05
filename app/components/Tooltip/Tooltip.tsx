import classNames from "classnames";
import { CSSProperties, ReactNode, useState } from "react";

interface Props {
  infoText: string;
  children: ReactNode;
  alwaysVisible?: boolean;
  position?:
    | "top-start"
    | "top"
    | "top-end"
    | "bottom-start"
    | "bottom"
    | "bottom-end";
  className?: string;
  style?: CSSProperties;
  disabledHover?: boolean;
}

const Tooltip = ({
  infoText,
  children,
  alwaysVisible,
  position = "top",
  disabledHover = false,
  className,
  style,
}: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex flex-col gap-4 items-center justify-center relative"
      onMouseEnter={() => !disabledHover && setShowTooltip(true)}
      onMouseLeave={() => !disabledHover && setShowTooltip(false)}
    >
      {children}
      <div
        className={classNames(
          "max-w-[250px] w-fit bg-purple-400 text-center opacity-0 p-4 rounded-lg absolute z-50 h-fit text-sm font-normal ",
          {
            "opacity-100": alwaysVisible || showTooltip,
            "left-0 -top-1 translate-y-[-100%]": position === "top-start",
            "left-1/2 -translate-x-1/2 -top-1 translate-y-[-100%] w-full":
              position === "top",
            "right-0 -top-1 translate-y-[-100%]": position === "top-end",
            "left-0 -bottom-1 translate-y-full": position === "bottom-start",
            "left-1/2 -translate-x-1/2 -bottom-1 translate-y-full w-full":
              position === "bottom",
            "right-0 -bottom-1 translate-y-full": position === "bottom-end",
          },
          className,
        )}
        style={style}
      >
        <p
          className={classNames("text-sm text-white", {
            "text-start": position.includes("start"),
            "text-center":
              !position.includes("start") && !position.includes("end"),
            "text-end": position.includes("end"),
          })}
        >
          {infoText}
        </p>
        <div
          className={classNames("w-0 h-0 absolute", {
            "border-t-[18px] border-t-purple-400 border-l-[18px] border-l-[transparent] border-r-[18px] border-r-[transparent]":
              position.startsWith("top"),
            "border-r-[18px] border-r-purple-400 border-t-[18px] border-t-[transparent] border-b-[18px] border-b-[transparent]":
              position.startsWith("right"),
            "border-b-[18px] border-b-purple-400 border-l-[18px] border-l-[transparent] border-r-[18px] border-r-[transparent]":
              position.startsWith("bottom"),
            "border-l-[18px] border-l-purple-400 border-t-[18px] border-t-[transparent] border-b-[18px] border-b-[transparent]":
              position.startsWith("left"),
            "left-[calc(40px-18px)] -bottom-3": position === "top-start",
            "left-[calc(50%-18px)] -bottom-3": position === "top",
            "right-[calc(40px-18px)] -bottom-3": position === "top-end",
            "left-[calc(40px-18px)] -top-3": position === "bottom-start",
            "left-[calc(50%-18px)] -top-3": position === "bottom",
            "right-[calc(40px-18px)] -top-3": position === "bottom-end",
          })}
        />
      </div>
    </div>
  );
};

export default Tooltip;
