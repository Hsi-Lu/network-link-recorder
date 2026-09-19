import * as React from 'react'
import { cn } from '@/lib/utils'

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> & {
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <input
      type="checkbox"
      className={cn('h-4 w-4 rounded border-input accent-primary', className)}
      checked={Boolean(checked)}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  )
}
