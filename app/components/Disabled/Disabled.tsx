"use client";

import classNames from "classnames";
import { ReactNode } from "react";
import { toast } from "react-toastify";

interface Props {
  disabled: boolean;
  children: ReactNode;
  className?: string;
  toastMessage?: string;
}
const Disabled = ({ disabled, children, className, toastMessage }: Props) => {
  if (disabled) {
    return (
      <div
        onClick={() => !!toastMessage && toast.info(toastMessage)}
        className={classNames(
          "relative after:content-empty after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[1]",
          className,
        )}
      >
        <div className="pointer-events-none">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Disabled;
