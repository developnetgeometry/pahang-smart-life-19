import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 hover-scale",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground shadow-elegant hover:bg-destructive/90 hover:shadow-glow",
        outline:
          "border border-input bg-background/80 backdrop-blur hover:bg-accent hover:text-accent-foreground shadow-community supports-[backdrop-filter]:bg-background/60",
        secondary:
          "bg-secondary/80 backdrop-blur text-secondary-foreground shadow-community hover:bg-secondary/70 supports-[backdrop-filter]:bg-secondary/60",
        ghost: "hover:bg-accent/80 hover:text-accent-foreground backdrop-blur transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
