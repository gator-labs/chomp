import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { SpinnerIcon } from "../Icons/ToastIcons/SpinnerIcon";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        primary:
          "border border-gray-500 bg-purple-500 text-white shadow-sm hover:bg-primary-muted hover:text-white dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        outline:
          "text-white shadow hover:text-gray-200 border border-gray-500 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        destructive:
          "border border-gray-500 bg-destructive text-white shadow-sm hover:bg-[#ED6A5A] hover:text-white dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        disabled:
          "border border-gray-500 bg-gray-400 text-gray-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 pointer-events-none",
        ghost: "text-white hover:text-gray-200",
      },
      size: {
        default: "h-[50px] p-1 rounded-[8px] gap-1",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  isPill?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      isFullWidth = true,
      isPill = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && "disabled:opacity-1",
          isFullWidth && "w-full",
          isPill && "!rounded-full",
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? <SpinnerIcon /> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
