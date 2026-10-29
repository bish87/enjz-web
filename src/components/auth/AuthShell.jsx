import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function AuthShell({ title, subtitle, children, footer }) {
  const { t } = useTranslation()

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-black lg:flex xl:p-14">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-black text-sm font-extrabold text-brand">
            E
          </span>
          <span className="text-xl font-extrabold tracking-tight">enjz.</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight xl:text-5xl">
            {t('home.heroTitle')}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-black/75">
            {t('home.heroSubtitle')}
          </p>

          <ul className="mt-8 space-y-3">
            {[t('home.step1Text'), t('home.step2Text'), t('home.step3Text')].map(
              (item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-black/10">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-black/80">{item}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <p className="text-xs font-medium text-black/60">{t('common.tagline')}</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark dark:text-brand">
              {t('common.appName')}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          {children}

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
