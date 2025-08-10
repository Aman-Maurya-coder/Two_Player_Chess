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
      className={cn("flex flex-row justify-start md:grid md:grid-flow-col md:auto-cols-max md:justify-between md:w-full flex-wrap items-start space-x-[calc(100vw*0.03)] md:space-x-0 box-border", className)}
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
        "flex justify-center items-center bg-secondary-background py-1 px-3 md:px-0 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 w-[calc(100vw*0.18)] h-[calc(100vh*0.04)] sm:max-w-[132px] sm:max-h-[54px] md:w-[calc(100vw*0.15)] md:h-[calc(100vh*0.05)] lg:w-[calc(100vw*0.07)] lg:h-[calc(100vh*0.06)] rounded-[5px]  text-primary focus-visible:border-ring focus-visible:ring-ring/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/50 aria-invalid:border-destructive dark:bg-input/30 aspect-square shrink-0  shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50",
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
