import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const styles = {
  positive:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  negative:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  neutral: 'border-border bg-muted text-muted-foreground',
}

function toneFor(status) {
  switch (status) {
    case 'ACTIVE':
    case 'VERIFIED':
    case 'ACCEPTED':
    case 'COMPLETED':
      return 'positive'
    case 'PENDING':
      return 'warning'
    case 'REJECTED':
    case 'SUSPENDED':
    case 'DECLINED':
    case 'CANCELLED':
      return 'negative'
    default:
      return 'neutral'
  }
}

export function StatusBadge({ status, label, className }) {
  const { t } = useTranslation()

  if (!status) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full font-semibold', styles[toneFor(status)], className)}
    >
      {label || t(`common.status.${status}`, { defaultValue: status })}
    </Badge>
  )
}
