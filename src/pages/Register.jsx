import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, BriefcaseBusiness, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthShell } from '@/components/auth/AuthShell'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/api'
import { makeRegisterSchema } from '@/lib/schemas'
import { cn } from '@/lib/utils'

export default function Register() {
  const { t } = useTranslation()
  const { user, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialRole =
    searchParams.get('role') === 'provider' ? 'PROVIDER' : 'CUSTOMER'

  const schema = useMemo(() => makeRegisterSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      city: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  const role = watch('role')

  if (user) {
    return (
      <Navigate
        to={
          user.role === 'ADMIN'
            ? '/admin'
            : user.role === 'PROVIDER'
              ? '/provider'
              : '/providers'
        }
        replace
      />
    )
  }

  async function onSubmit(values) {
    const { confirmPassword: _confirmPassword, ...payload } = values

    try {
      await registerUser({
        ...payload,
        email: payload.email || null,
        lastName: payload.lastName || null,
      })

      toast.success(t('auth.registerSuccess'))

      if (payload.role === 'PROVIDER') {
        toast.info(t('auth.providerPending'))
        navigate('/provider', { replace: true })
      } else {
        navigate('/providers', { replace: true })
      }
    } catch (error) {
      const message = getErrorMessage(error, t('errors.generic'))
      form.setError('root', { message })
      toast.error(message)
    }
  }

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            {t('auth.signInLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.message ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>{t('auth.accountType')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'CUSTOMER', icon: UserRound, label: t('auth.customer') },
              { value: 'PROVIDER', icon: BriefcaseBusiness, label: t('auth.provider') },
            ].map((option) => {
              const Icon = option.icon
              const active = role === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value, { shouldValidate: true })}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand bg-brand-soft text-emerald-900 dark:text-emerald-200'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="size-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {role === 'PROVIDER' ? t('auth.providerHint') : t('auth.customerHint')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t('auth.firstName')}</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              aria-invalid={Boolean(errors.firstName)}
              {...register('firstName')}
            />
            {errors.firstName ? (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">
              {t('auth.lastName')}{' '}
              <span className="font-normal text-muted-foreground">
                ({t('common.optional')})
              </span>
            </Label>
            <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
            {errors.lastName ? (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">{t('auth.phone')}</Label>
          <PhoneInput
            id="phone"
            autoComplete="tel"
            placeholder="912 345 678"
            aria-invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('auth.phoneHint')}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">
              {t('auth.email')}{' '}
              <span className="font-normal text-muted-foreground">
                ({t('common.optional')})
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">{t('auth.city')}</Label>
            <Input
              id="city"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
              {...register('city')}
            />
            {errors.city ? (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : t('auth.createAccountButton')}
        </Button>
      </form>
    </AuthShell>
  )
}
