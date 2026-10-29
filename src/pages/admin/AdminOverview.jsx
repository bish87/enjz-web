import {
  ArrowRight,
  FolderTree,
  MapPinned,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminProviders, useAreas, useCategories } from '@/hooks/queries'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, to, tint, loading }) {
  return (
    <Link
      to={to}
      className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Card className="gap-0 py-0 transition-all group-hover:-translate-y-0.5 group-hover:border-brand/50 group-hover:shadow-sm">
        <CardContent className="flex items-start justify-between gap-3 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
            )}
          </div>
          <span
            className={cn(
              'grid size-10 place-items-center rounded-lg',
              tint || 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="size-5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function AdminOverview() {
  const { t, i18n } = useTranslation()
  const providersQuery = useAdminProviders()
  const categoriesQuery = useCategories()
  const areasQuery = useAreas()

  const providers = providersQuery.data || []
  const pending = providers.filter(
    (provider) => provider.verificationStatus === 'PENDING'
  )
  const language = i18n.resolvedLanguage
  const isLoading = providersQuery.isLoading
  const hasError = providersQuery.isError

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.title')} subtitle={t('admin.subtitle')} />

      {hasError ? (
        <ErrorState onRetry={() => providersQuery.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label={t('admin.totalProviders')}
              value={formatNumber(providers.length, language)}
              to="/admin/providers"
              loading={isLoading}
              tint="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300"
            />
            <StatCard
              icon={ShieldCheck}
              label={t('admin.pendingVerifications')}
              value={formatNumber(pending.length, language)}
              to="/admin/providers"
              loading={isLoading}
              tint="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"
            />
            <StatCard
              icon={FolderTree}
              label={t('admin.totalCategories')}
              value={formatNumber((categoriesQuery.data || []).length, language)}
              to="/admin/categories"
              loading={categoriesQuery.isLoading}
              tint="bg-brand-soft text-emerald-700 dark:text-emerald-300"
            />
            <StatCard
              icon={MapPinned}
              label={t('admin.totalAreas')}
              value={formatNumber((areasQuery.data || []).length, language)}
              to="/admin/areas"
              loading={areasQuery.isLoading}
              tint="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{t('admin.pendingVerifications')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.providersSubtitle')}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin/providers">
                      {t('common.viewAll')}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 rounded-lg" />
                  ))
                ) : pending.length === 0 ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title={t('admin.noProviders')}
                    description={t('admin.noProvidersHint')}
                  />
                ) : (
                  pending.slice(0, 4).map((provider) => {
                    const fullName = [
                      provider.user?.firstName,
                      provider.user?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <div
                        key={provider.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {provider.user?.phone} · {provider.user?.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={provider.verificationStatus} />
                          <Button asChild size="sm" variant="outline">
                            <Link to="/admin/providers">{t('admin.review')}</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/admin/providers">
                    <ShieldCheck className="size-4" />
                    {t('admin.providersTitle')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/admin/categories">
                    <FolderTree className="size-4" />
                    {t('admin.categoriesTitle')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/admin/areas">
                    <MapPinned className="size-4" />
                    {t('admin.areasTitle')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
