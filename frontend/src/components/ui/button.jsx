import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground text-3xl shadow-xs hover:bg-primary/85",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs text-3xl hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "border-2 border-accent/20 text-3xl font-sans font-medium rounded-xs bg-secondary/90 lg:text-2xl xl:text-3xl 2xl:text-2xl hover:shadow-foreground/35 focus-visible:shadow-primary focus-visible:ring-0 focus-visible:border-none",
        hero_outline: "border-2 border-foreground/20 text-3xl rounded-sm lg:text-2xl xl:text-3xl 2xl:text-2xl hover:shadow-foreground/35 hover:border-accent/20 hover:bg-secondary/90 hover:text-primary-foreground focus-visible:shadow-primary focus-visible:border-none focus-visible:ring-0",
        form: "",
        form_outline: "text-3xl font-medium border",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        md: "h-10 rounded-md px-5 has-[>svg]:px-3",
        lg: "h-12 w-xs rounded-md px-6 has-[>svg]:px-4",
        form: "w-45 h-16",
        hero: "px-4 py-1 w-xs h-20 lg:w-60 xl:w-70 2xl:w-65",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
