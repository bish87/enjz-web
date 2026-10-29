import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ProviderCard } from '@/components/common/ProviderCard'
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAreas, useCategories, useProviders } from '@/hooks/queries'
import { formatNumber } from '@/lib/format'

const ALL = 'all'
const PAGE_SIZE = 9

export default function Providers() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const areaId = searchParams.get('areaId') || ''
  const available = searchParams.get('available') === 'true'
  const page = Math.max(Number(searchParams.get('page')) || 1, 1)

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const categoriesQuery = useCategories()
  const areasQuery = useAreas()

  const providersQuery = useProviders({
    search,
    categoryId,
    areaId,
    available: available ? 'true' : '',
    page,
    limit: PAGE_SIZE,
  })

  const providers = providersQuery.data?.data || []
  const pagination = providersQuery.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 0
  const hasFilters = Boolean(search || categoryId || areaId || available)

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)

    if (!value || value === ALL) {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    if (key !== 'page') {
      next.delete('page')
    }

    setSearchParams(next, { replace: true })
  }

  function handleSearch(event) {
    event.preventDefault()
    setParam('search', searchInput.trim())
  }

  function resetFilters() {
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="container-page py-10 sm:py-12">
      <PageHeader title={t('providers.title')} subtitle={t('providers.subtitle')} />

      <Card className="mt-6 p-4">
        <form
          onSubmit={handleSearch}
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('providers.searchPlaceholder')}
              aria-label={t('common.search')}
              className="h-10 ps-9"
            />
          </div>

          <Select
            value={categoryId || ALL}
            onValueChange={(value) => setParam('categoryId', value)}
          >
            <SelectTrigger className="h-10 w-full" aria-label={t('providers.category')}>
              <SelectValue placeholder={t('providers.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('providers.allCategories')}</SelectItem>
              {(categoriesQuery.data || []).map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={areaId || ALL}
            onValueChange={(value) => setParam('areaId', value)}
          >
            <SelectTrigger className="h-10 w-full" aria-label={t('providers.area')}>
              <SelectValue placeholder={t('providers.allAreas')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('providers.allAreas')}</SelectItem>
              {(areasQuery.data || []).map((area) => (
                <SelectItem key={area.id} value={String(area.id)}>
                  {area.name} — {area.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="brand" className="h-10">
            <Search className="size-4" />
            {t('common.search')}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <Switch
              id="available-only"
              checked={available}
              onCheckedChange={(checked) =>
                setParam('available', checked ? 'true' : '')
              }
            />
            <Label htmlFor="available-only" className="cursor-pointer text-sm">
              {t('providers.availableOnly')}
            </Label>
          </div>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="size-4" />
              {t('providers.reset')}
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5" />
              {t('providers.filters')}
            </span>
          )}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {providersQuery.isLoading
            ? t('common.loading')
            : t('common.results', {
                total: formatNumber(total, i18n.resolvedLanguage),
              })}
        </p>
      </div>

      {providersQuery.isError ? (
        <ErrorState
          className="mt-4"
          message={providersQuery.error?.response?.data?.message}
          onRetry={() => providersQuery.refetch()}
        />
      ) : providersQuery.isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProviderCardSkeleton key={index} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={Search}
          title={t('providers.noResults')}
          description={t('providers.noResultsHint')}
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="size-4" />
                {t('providers.reset')}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam('page', String(page - 1))}
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setParam('page', String(page + 1))}
          >
            {t('common.next')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
