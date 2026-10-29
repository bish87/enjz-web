import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function Logo({ to = '/', className }) {
  const content = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
        E
      </span>
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        enjz<span className="text-brand">.</span>
      </span>
    </>
  )

  if (!to) {
    return <span className={cn('inline-flex items-center gap-2', className)}>{content}</span>
  }

  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2', className)}
      aria-label="enjz"
    >
      {content}
    </Link>
  )
}
