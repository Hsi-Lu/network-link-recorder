import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-card p-0 text-card-foreground shadow-md outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
