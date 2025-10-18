import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] transform",
  {
    variants: {
      variant: {
        default: "bg-[#161950] text-white hover:bg-[#1E2B5B] hover:shadow-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        outline:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        link: "text-[#465FFF] underline-offset-4 hover:underline hover:text-[#3451E6]",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        warning: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        info: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        xl: "h-14 rounded-lg px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
