import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { api, getErrorMessage } from '@/lib/api'
import { formatDate, formatPhone, initials } from '@/lib/format'
import { makeProfileSchema } from '@/lib/schemas'

export default function Profile() {
  const { t, i18n } = useTranslation()
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const schema = useMemo(() => makeProfileSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', city: '' },
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = form

  useEffect(() => {
    refreshUser().catch(() => {})
  }, [refreshUser])

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        city: user.city || '',
      })
    }
  }, [user, reset])

  async function onSubmit(values) {
    try {
      await api.patch('/users/profile', {
        ...values,
        lastName: values.lastName || null,
      })
      await refreshUser()
      toast.success(t('profile.saved'))
    } catch (error) {
      const message = getErrorMessage(error, t('errors.generic'))
      setError('root', { message })
      toast.error(message)
    }
  }

  if (!user) {
    return null
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('profile.personalInfoHint')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {errors.root?.message ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {errors.root.message}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                  <Input
                    id="firstName"
                    aria-invalid={Boolean(errors.firstName)}
                    {...register('firstName')}
                  />
                  {errors.firstName ? (
                    <p className="text-xs text-destructive">
                      {errors.firstName.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName ? (
                    <p className="text-xs text-destructive">
                      {errors.lastName.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">{t('auth.city')}</Label>
                <Input
                  id="city"
                  aria-invalid={Boolean(errors.city)}
                  {...register('city')}
                />
                {errors.city ? (
                  <p className="text-xs text-destructive">{errors.city.message}</p>
                ) : null}
              </div>

              <Button type="submit" variant="brand" disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('profile.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-brand-soft text-base font-bold text-emerald-800 dark:text-emerald-300">
                    {initials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`common.role.${user.role}`)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={user.role} label={t(`common.role.${user.role}`)} />
                <StatusBadge status={user.status} />
              </div>

              <div className="space-y-2.5 border-t pt-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span dir="ltr">{formatPhone(user.phone)}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{user.email || '—'}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {user.city}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('profile.contact')}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('profile.contactHint')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('profile.role')}</span>
                <span className="font-medium">{t(`common.role.${user.role}`)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t('profile.status')}</span>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {t('profile.memberSince')}
                </span>
                <span className="font-medium">
                  {formatDate(user.createdAt, i18n.resolvedLanguage)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut className="size-4" />
            {t('common.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}
