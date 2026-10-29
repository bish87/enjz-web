import { Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'

import { LanguageToggle } from '@/components/common/LanguageToggle'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }) =>
  cn(
    'text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground'
  )

export function Navbar() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const isRtl = i18n.dir() === 'rtl'

  const links = [{ to: '/providers', label: t('nav.browse') }]

  if (user?.role === 'PROVIDER') {
    links.push({ to: '/provider', label: t('nav.dashboard') })
  }

  if (user?.role === 'ADMIN') {
    links.push({ to: '/admin', label: t('nav.admin') })
  }

  if (!user) {
    links.push({ to: '/register?role=provider', label: t('nav.forProviders') })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={t('nav.menu')}
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRtl ? 'right' : 'left'} className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo to="/" />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-soft text-emerald-900 dark:text-emerald-200'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            {!user ? (
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <Button asChild variant="outline">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    {t('nav.signIn')}
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    {t('nav.signUp')}
                  </Link>
                </Button>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        <Logo />

        <nav className="ms-6 hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">{t('nav.signUp')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
