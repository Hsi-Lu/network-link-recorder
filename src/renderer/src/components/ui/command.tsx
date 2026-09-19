import { Command as CommandPrimitive } from 'cmdk'
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-card', className)}
      {...props}
    />
  )
}

export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="border-b px-3">
      <CommandPrimitive.Input
        className={cn(
          'flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground',
          className
        )}
        {...props}
      />
    </div>
  )
}

export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn('max-h-64 overflow-y-auto p-1', className)} {...props} />
}

export function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty className={cn('py-6 text-center text-sm text-muted-foreground', className)} {...props} />
  )
}

export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn('overflow-hidden', className)} {...props} />
}

export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent',
        className
      )}
      {...props}
    />
  )
}
