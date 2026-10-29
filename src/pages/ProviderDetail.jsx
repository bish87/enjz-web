import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Clock,
  MapPin,
  Wrench,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { RatingStars } from '@/components/common/RatingStars'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProvider } from '@/hooks/queries'
import { formatPrice, initials } from '@/lib/format'

export default function ProviderDetail() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const providerQuery = useProvider(id)
  const provider = providerQuery.data

  if (providerQuery.isLoading) {
    return (
      <div className="container-page space-y-4 py-10">
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (providerQuery.isError) {
    if (providerQuery.error?.response?.status === 404) {
      return (
        <div className="container-page py-16">
          <EmptyState
            icon={Wrench}
            title={t('providers.notFound')}
            description={t('providers.notFoundHint')}
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/providers">{t('providers.backToBrowse')}</Link>
              </Button>
            }
          />
        </div>
      )
    }

    return (
      <div className="container-page py-16">
        <ErrorState onRetry={() => providerQuery.refetch()} />
      </div>
    )
  }

  if (!provider) {
    return null
  }

  const fullName = [provider.firstName, provider.lastName]
    .filter(Boolean)
    .join(' ')
  const startingPrice = formatPrice(provider.startingPrice, i18n.resolvedLanguage)

  return (
    <div className="container-page py-8 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="-ms-2 mb-4">
        <Link to="/providers">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('providers.backToBrowse')}
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="h-1.5 bg-brand" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="size-20 rounded-2xl after:rounded-2xl sm:size-24">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={fullName}
                  className="aspect-square size-full object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-brand-soft text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
                {initials(provider.firstName, provider.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {fullName}
                </h1>
                <StatusBadge status="VERIFIED" label={t('providers.verified')} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {provider.city}
                </span>
                <RatingStars
                  value={provider.ratingAvg}
                  count={provider.ratingCount}
                />
                {provider.experienceYears ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="size-4" />
                    {t('providers.experience', {
                      years: provider.experienceYears,
                    })}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <StatusBadge
                  status={provider.isAvailable ? 'ACTIVE' : 'SUSPENDED'}
                  label={
                    provider.isAvailable
                      ? t('common.available')
                      : t('common.unavailable')
                  }
                />
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {t('providers.bookingSoon')}
                </span>
              </div>
            </div>

            {startingPrice ? (
              <div className="rounded-xl border bg-muted/40 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t('common.from')}
                </p>
                <p className="text-lg font-extrabold">{startingPrice}</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('providers.about')}</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.bio ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {provider.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('providers.services')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {provider.categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                provider.categories.map((category, index) => (
                  <div key={category.id}>
                    {index > 0 ? <Separator className="my-1" /> : null}
                    <div className="flex items-center justify-between gap-4 py-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <BadgeCheck className="size-4 text-brand-dark dark:text-brand" />
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {category.price !== null &&
                        category.price !== undefined
                          ? formatPrice(category.price, i18n.resolvedLanguage)
                          : t('providers.priceOnRequest')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('providers.areasServed')}</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.areas.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {provider.areas.map((area) => (
                    <Badge
                      key={area.id}
                      variant="secondary"
                      className="rounded-full font-medium"
                    >
                      {area.name}, {area.state}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="space-y-4 p-5">
              {startingPrice ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('common.from')}
                  </p>
                  <p className="text-2xl font-extrabold">{startingPrice}</p>
                </div>
              ) : (
                <p className="text-sm font-semibold">
                  {t('providers.priceOnRequest')}
                </p>
              )}

              <Button className="w-full" size="lg" disabled>
                {t('providers.requestService')}
              </Button>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('providers.bookingSoon')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
