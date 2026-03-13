import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // Sizes
        "data-[size=default]:h-[22px] data-[size=default]:w-[40px]",
        "data-[size=sm]:h-[16px] data-[size=sm]:w-[28px]",
        // Checked state — primary background
        "data-[state=checked]:bg-primary",
        // Unchecked state — visible muted track in both light and dark modes
        "data-[state=unchecked]:bg-muted-foreground/30 dark:data-[state=unchecked]:bg-muted-foreground/25",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
          // Default size thumb
          "group-data-[size=default]/switch:size-[16px]",
          "group-data-[size=default]/switch:data-[state=checked]:translate-x-[20px]",
          "group-data-[size=default]/switch:data-[state=unchecked]:translate-x-[3px]",
          // Small size thumb
          "group-data-[size=sm]/switch:size-[12px]",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-[14px]",
          "group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-[2px]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
