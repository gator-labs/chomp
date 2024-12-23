import { cn } from "@/lib/utils";
import React, { CSSProperties, ReactNode, useEffect, useRef } from "react";

type AnimatedGradientBorderProps = {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const AnimatedGradientBorder = ({
  children,
  className,
  ...props
}: AnimatedGradientBorderProps) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boxElement = boxRef.current;

    if (!boxElement) {
      return;
    }

    const updateAnimation = () => {
      const angle =
        (parseFloat(boxElement.style.getPropertyValue("--angle")) + 0.5) % 360;
      boxElement.style.setProperty("--angle", `${angle}deg`);
      requestAnimationFrame(updateAnimation);
    };

    requestAnimationFrame(updateAnimation);
  }, []);

  return (
    <div
      ref={boxRef}
      style={
        {
          "--angle": "0deg",
          "--border-color":
            "linear-gradient(var(--angle), #F9F1FB 0%, #89C9FF 29%, #AF7CE7 59.5%, #FBD7FF 100%)",
          "--bg-color": "linear-gradient(#1B1B1B, #1B1B1B)",
        } as CSSProperties
      }
      className={cn(
        "flex w-[400px] items-center justify-center rounded-lg border-2 border-[#0000] p-4 [background:padding-box_var(--bg-color),border-box_var(--border-color)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedGradientBorder;
