import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Logo } from '@/components/common/Logo'

const year = new Date().getFullYear()

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-muted/40">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            {t('home.heroSubtitle')}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t('nav.browse')}</p>
          <Link
            to="/providers"
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('providers.title')}
          </Link>
          <Link
            to="/register?role=provider"
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('nav.forProviders')}
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t('common.appName')}</p>
          <Link
            to="/login"
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('nav.signIn')}
          </Link>
          <Link
            to="/register"
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('nav.signUp')}
          </Link>
        </div>
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {t('common.appName')}. {t('common.tagline')}.
          </p>
          <p>{t('home.heroBadge')}</p>
        </div>
      </div>
    </footer>
  )
}
