import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-7xl font-extrabold tracking-tighter text-brand">404</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {t('notFound.text')}
      </p>
      <Button asChild variant="brand" className="mt-6">
        <Link to="/">
          <Compass className="size-4" />
          {t('notFound.home')}
        </Link>
      </Button>
    </div>
  )
}
