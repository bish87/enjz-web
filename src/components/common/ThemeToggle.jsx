import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useTranslation()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('common.theme')}
      title={t('common.theme')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
