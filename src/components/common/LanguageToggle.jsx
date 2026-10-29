import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function LanguageToggle({ className }) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.resolvedLanguage?.startsWith('ar')
  const nextLanguage = isArabic ? 'en' : 'ar'

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => i18n.changeLanguage(nextLanguage)}
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <Languages className="size-4" />
      <span className="font-semibold">{isArabic ? 'EN' : 'العربية'}</span>
    </Button>
  )
}
