import { AlertTriangle, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ErrorState({ message, onRetry, className }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center',
        className
      )}
    >
      <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{message || t('common.error')}</p>
        <p className="text-sm text-muted-foreground">{t('common.errorHint')}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-4" />
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  )
}
