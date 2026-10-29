import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { ProviderCard } from '@/components/common/ProviderCard'
import { ProviderCardSkeleton } from '@/components/providers/ProviderCardSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAreas, useCategories, useProviders } from '@/hooks/queries'
import { formatNumber } from '@/lib/format'
import { categoryIcon, stepIcons } from '@/lib/icons'

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const categoriesQuery = useCategories()
  const areasQuery = useAreas()
  const providersQuery = useProviders({ limit: 6, page: 1 })
  const statsQuery = useProviders({ limit: 1, page: 1 })

  const categories = categoriesQuery.data || []
  const providers = providersQuery.data?.data || []
  const totalProviders = statsQuery.data?.pagination?.total
  const language = i18n.resolvedLanguage

  const steps = [
    { key: 'search', title: t('home.step1Title'), text: t('home.step1Text') },
    { key: 'compare', title: t('home.step2Title'), text: t('home.step2Text') },
    { key: 'book', title: t('home.step3Title'), text: t('home.step3Text') },
  ]

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) {
      params.set('search', search.trim())
    }
    navigate({ pathname: '/providers', search: params.toString() })
  }

  return (
    <div>
      <section className="border-b bg-muted/40">
        <div className="container-page py-14 sm:py-20 lg:py-24">
          <Badge
            variant="outline"
            className="rounded-full border-brand/40 bg-brand-soft px-3 py-1 text-emerald-800 dark:text-emerald-300"
          >
            <Sparkles className="size-3.5" />
            {t('home.heroBadge')}
          </Badge>

          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {t('home.heroTitle')}
            <span className="text-brand-dark dark:text-brand">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('home.heroSubtitle')}
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row sm:rounded-full"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('home.searchPlaceholder')}
                aria-label={t('common.search')}
                className="h-11 border-0 bg-transparent ps-11 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" variant="brand" size="lg" className="h-11 px-7">
              {t('home.searchButton')}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                to={`/providers?categoryId=${category.id}`}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t pt-6">
            <div>
              <p className="text-2xl font-extrabold">
                {totalProviders === undefined
                  ? '—'
                  : formatNumber(totalProviders, language)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('home.statProviders')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">
                {categoriesQuery.isLoading
                  ? '—'
                  : formatNumber(categories.length, language)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('home.statCategories')}
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">
                {areasQuery.isLoading
                  ? '—'
                  : formatNumber((areasQuery.data || []).length, language)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('home.statAreas')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('home.popularCategories')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('home.popularCategoriesSubtitle')}
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/providers">
              {t('common.viewAll')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        {categoriesQuery.isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => {
              const Icon = categoryIcon(category.name)
              return (
                <Link
                  key={category.id}
                  to={`/providers?categoryId=${category.id}`}
                  className="group flex flex-col items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-sm"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-black dark:text-brand">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-y bg-muted/30">
        <div className="container-page py-14 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t('home.featuredProviders')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('home.featuredProvidersSubtitle')}
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/providers">
                {t('common.viewAll')}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          {providersQuery.isLoading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProviderCardSkeleton key={index} />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={Search}
              title={t('providers.noResults')}
              description={t('providers.noResultsHint')}
            />
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t('home.howItWorks')}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = stepIcons[step.key]
            return (
              <Card key={step.key} className="gap-0 py-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand-dark dark:text-brand">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-3xl font-extrabold text-muted-foreground/25">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="overflow-hidden rounded-2xl bg-brand px-6 py-10 text-black sm:px-10 sm:py-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {t('home.providerCtaTitle')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-black/80">
                {t('home.providerCtaText')}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-black/90"
            >
              <Link to="/register?role=provider">
                {t('home.providerCtaButton')}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
