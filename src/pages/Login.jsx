import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AuthShell } from '@/components/auth/AuthShell'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/api'
import { makeLoginSchema } from '@/lib/schemas'

function defaultDestination(user, from) {
  if (from) {
    return from
  }
  if (user.role === 'ADMIN') {
    return '/admin'
  }
  if (user.role === 'PROVIDER') {
    return '/provider'
  }
  return '/profile'
}

export default function Login() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const schema = useMemo(() => makeLoginSchema(t), [t])
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  if (user) {
    return <Navigate to={defaultDestination(user, from)} replace />
  }

  async function onSubmit(values) {
    try {
      const loggedIn = await login(values)
      toast.success(t('auth.loginSuccess'))
      navigate(defaultDestination(loggedIn, from), { replace: true })
    } catch (error) {
      const message = getErrorMessage(error, t('errors.generic'))
      form.setError('root', { message })
      toast.error(message)
    }
  }

  return (
    <AuthShell
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            {t('auth.signUpLink')}
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

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.loading') : t('auth.signInButton')}
        </Button>
      </form>
    </AuthShell>
  )
}
