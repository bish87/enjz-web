import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { LanguageToggle } from '@/components/common/LanguageToggle'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
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

function SideLink({ to, end, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-soft text-emerald-900 dark:text-emerald-200'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )
      }
    >
      {Icon ? <Icon className="size-4" /> : null}
      <span>{label}</span>
    </NavLink>
  )
}

export function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const isRtl = i18n.dir() === 'rtl'

  const items =
    role === 'ADMIN'
      ? [
          { to: '/admin', end: true, icon: LayoutDashboard, label: t('nav.overview') },
          { to: '/admin/providers', icon: ShieldCheck, label: t('admin.providers') },
          { to: '/admin/categories', icon: FolderTree, label: t('admin.categories') },
          { to: '/admin/areas', icon: MapPinned, label: t('admin.areas') },
        ]
      : [
          { to: '/provider', end: true, icon: Building2, label: t('nav.overview') },
          {
            to: `/providers/${user?.id}`,
            icon: ExternalLink,
            label: t('providerDash.preview'),
          },
        ]

  const title = role === 'ADMIN' ? t('admin.title') : t('providerDash.title')

  function handleLogout() {
    logout()
    navigate('/')
  }

  function renderNav(onNavigate) {
    return (
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => (
          <SideLink key={item.to} {...item} onNavigate={onNavigate} />
        ))}
        <div className="mt-3 border-t pt-3">
          <SideLink
            to="/"
            icon={ArrowLeft}
            label={t('nav.backToSite')}
            onNavigate={onNavigate}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </nav>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo />
        </div>
        {renderNav()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t('nav.menu')}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRtl ? 'right' : 'left'} className="flex w-72 flex-col">
              <SheetHeader>
                <SheetTitle>
                  <Logo to="/" />
                </SheetTitle>
              </SheetHeader>
              {renderNav(() => setOpen(false))}
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
            </p>
          </div>

          <div className="ms-auto flex items-center gap-1">
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title={t('common.logout')}
              aria-label={t('common.logout')}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
