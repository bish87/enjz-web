import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { RatingStars } from '@/components/common/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, initials } from '@/lib/format'

export function ProviderCard({ provider }) {
  const { t, i18n } = useTranslation()
  const fullName = [provider.firstName, provider.lastName]
    .filter(Boolean)
    .join(' ')
  const startingPrice = formatPrice(provider.startingPrice, i18n.resolvedLanguage)
  const categories = provider.categories || []

  return (
    <Link
      to={`/providers/${provider.id}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 border-border/80 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-brand/60 group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar className="size-14 rounded-xl after:rounded-xl after:border-border">
              {provider.avatar ? (
                <img
                  src={provider.avatar}
                  alt={fullName}
                  className="aspect-square size-full object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-brand-soft text-base font-bold text-emerald-800 dark:text-emerald-300">
                {initials(provider.firstName, provider.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-bold leading-tight">
                  {fullName}
                </h3>
                {provider.isAvailable ? (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-dark dark:text-brand">
                    <span className="size-1.5 rounded-full bg-brand" />
                    {t('common.available')}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{provider.city}</span>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <RatingStars
                  value={provider.ratingAvg}
                  count={provider.ratingCount}
                />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="size-3.5" />
                  {t('providers.verified')}
                </span>
              </div>
            </div>
          </div>

          {provider.bio ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {provider.bio}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 3).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="rounded-full font-medium"
              >
                {category.name}
              </Badge>
            ))}
            {categories.length > 3 ? (
              <Badge variant="outline" className="rounded-full">
                +{categories.length - 3}
              </Badge>
            ) : null}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
            <div>
              {startingPrice ? (
                <>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t('common.from')}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {startingPrice}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('providers.priceOnRequest')}
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors group-hover:text-brand-dark dark:group-hover:text-brand">
              {t('common.viewProfile')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
