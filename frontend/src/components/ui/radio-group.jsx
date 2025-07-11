import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-row justify-start items-start space-x-[calc(100vw*0.03)] box-border", className)}
      {...props} />
  );
}

function RadioGroupItem({
  className,
  children,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "w-[calc(100vw*0.18)] h-[calc(100vh*0.04)] sm:max-w-[132px] sm:max-h-[54px] rounded-[5px] border-border text-primary focus-visible:border-ring focus-visible:ring-ring/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/50 aria-invalid:border-destructive dark:bg-input/30 aspect-square shrink-0 border-2 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      {/* <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center">
        <CircleIcon
          className="fill-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator> */}
      {children}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem }
