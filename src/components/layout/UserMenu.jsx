import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import { initials } from '@/lib/format'

export function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  const dashboardPath =
    user.role === 'ADMIN' ? '/admin' : user.role === 'PROVIDER' ? '/provider' : null

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full border border-border/70 ps-1 pe-2.5"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand-soft text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">
            {user.firstName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {t(`common.role.${user.role}`)}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="size-4" />
            {t('nav.profile')}
          </Link>
        </DropdownMenuItem>
        {dashboardPath ? (
          <DropdownMenuItem asChild>
            <Link to={dashboardPath}>
              <LayoutDashboard className="size-4" />
              {user.role === 'ADMIN' ? t('nav.admin') : t('nav.dashboard')}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {user.role === 'ADMIN' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin/providers">
              <ShieldCheck className="size-4" />
              {t('admin.providers')}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {t('common.logout', { defaultValue: 'Log out' })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
