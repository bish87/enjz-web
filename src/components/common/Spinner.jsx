import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand', className)} />
}

export function LoadingScreen() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="size-6" />
      <p className="text-sm">{t('common.loading')}</p>
    </div>
  )
}
