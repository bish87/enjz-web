import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PhoneInput({ className, ...props }) {
  return (
    <div className="flex">
      <span className="inline-flex h-9 items-center rounded-s-md border border-e-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
        +249
      </span>
      <Input
        type="tel"
        inputMode="tel"
        dir="ltr"
        className={cn('rounded-s-none rounded-e-md text-start', className)}
        {...props}
      />
    </div>
  )
}
