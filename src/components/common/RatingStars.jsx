import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export function RatingStars({ value = 0, count, showCount = true, className }) {
  const { i18n } = useTranslation()
  const rating = Number(value) || 0

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star className="size-4 fill-brand text-brand" aria-hidden="true" />
      <span className="text-sm font-semibold">
        {rating > 0 ? rating.toFixed(1) : '—'}
      </span>
      {showCount && count !== undefined ? (
        <span className="text-xs text-muted-foreground">
          ({formatNumber(count, i18n.resolvedLanguage)})
        </span>
      ) : null}
    </span>
  )
}
