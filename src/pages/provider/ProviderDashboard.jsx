import { zodResolver } from '@hookform/resolvers/zod'
import {
  BadgeCheck,
  ExternalLink,
  FolderTree,
  MapPinned,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAreas, useCategories, useMyProvider } from '@/hooks/queries'
import { api, getErrorMessage } from '@/lib/api'
import { formatNumber } from '@/lib/format'
import { makeProviderProfileSchema } from '@/lib/schemas'
import { cn } from '@/lib/utils'

const MAX_CATEGORIES = 10
const MAX_AREAS = 20

function invalidateProvider(queryClient) {
  return queryClient.invalidateQueries({ queryKey: ['provider', 'me'] })
}

function ProfileTab({ provider }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const schema = useMemo(() => makeProviderProfileSchema(t), [t])

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: '',
      experienceYears: '',
      startingPrice: '',
      isAvailable: true,
    },
  })

  useEffect(() => {
    form.reset({
      bio: provider.bio || '',
      experienceYears: provider.experienceYears ?? '',
      startingPrice: provider.startingPrice ?? '',
      isAvailable: provider.isAvailable,
    })
  }, [provider, form])

  const mutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.put('/providers/me', values)
      return data.provider
    },
    onSuccess: () => {
      invalidateProvider(queryClient)
      toast.success(t('providerDash.profileSaved'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  function onSubmit(values) {
    mutation.mutate({
      bio: values.bio?.trim() ? values.bio.trim() : null,
      experienceYears:
        values.experienceYears === '' || values.experienceYears === undefined
          ? null
          : Number(values.experienceYears),
      startingPrice:
        values.startingPrice === '' || values.startingPrice === undefined
          ? null
          : Number(values.startingPrice),
      isAvailable: values.isAvailable,
    })
  }

  const { register, handleSubmit, control, formState } = form

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('providerDash.profileTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('providerDash.profileSubtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {formState.errors.root?.message ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {formState.errors.root.message}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="bio">{t('providerDash.bio')}</Label>
            <Textarea
              id="bio"
              rows={5}
              placeholder={t('providerDash.bioPlaceholder')}
              aria-invalid={Boolean(formState.errors.bio)}
              {...register('bio')}
            />
            {formState.errors.bio ? (
              <p className="text-xs text-destructive">
                {formState.errors.bio.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="experienceYears">
                {t('providerDash.experienceYears')}
              </Label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={60}
                aria-invalid={Boolean(formState.errors.experienceYears)}
                {...register('experienceYears')}
              />
              {formState.errors.experienceYears ? (
                <p className="text-xs text-destructive">
                  {formState.errors.experienceYears.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startingPrice">
                {t('providerDash.startingPrice')}
              </Label>
              <Input
                id="startingPrice"
                type="number"
                min={0}
                aria-invalid={Boolean(formState.errors.startingPrice)}
                {...register('startingPrice')}
              />
              {formState.errors.startingPrice ? (
                <p className="text-xs text-destructive">
                  {formState.errors.startingPrice.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isAvailable" className="cursor-pointer">
                {t('providerDash.available')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('providerDash.availableHint')}
              </p>
            </div>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <Switch
                  id="isAvailable"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Button type="submit" variant="brand" disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : t('providerDash.saveProfile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CategoriesTab({ provider, categories, isLoading }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState({})

  useEffect(() => {
    const next = {}
    for (const category of provider.categories || []) {
      next[category.id] = category.price ?? ''
    }
    setSelected(next)
  }, [provider])

  const mutation = useMutation({
    mutationFn: async (items) => {
      const { data } = await api.put('/providers/me/categories', items)
      return data.provider
    },
    onSuccess: () => {
      invalidateProvider(queryClient)
      toast.success(t('providerDash.categoriesSaved'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const selectedIds = Object.keys(selected)
  const count = selectedIds.length

  function toggle(categoryId) {
    setSelected((current) => {
      if (Object.hasOwn(current, categoryId)) {
        const next = { ...current }
        delete next[categoryId]
        return next
      }

      if (Object.keys(current).length >= MAX_CATEGORIES) {
        toast.error(t('providerDash.maxCategories'))
        return current
      }

      return { ...current, [categoryId]: '' }
    })
  }

  function setPrice(categoryId, value) {
    setSelected((current) => ({ ...current, [categoryId]: value }))
  }

  function handleSave() {
    mutation.mutate({
      categories: selectedIds.map((id) => ({
        categoryId: Number(id),
        price: selected[id] === '' ? null : Number(selected[id]),
      })),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{t('providerDash.categoriesTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('providerDash.categoriesSubtitle')}
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {formatNumber(count, i18n.resolvedLanguage)} / {MAX_CATEGORIES}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title={t('providerDash.categoriesEmpty')}
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((category) => {
              const active = Object.hasOwn(selected, category.id)
              return (
                <div
                  key={category.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border p-3 transition-colors',
                    active ? 'border-brand/60 bg-brand-soft/40' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={active}
                      onCheckedChange={() => toggle(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="flex-1 cursor-pointer text-sm font-medium"
                    >
                      {category.name}
                    </Label>
                  </div>

                  {active ? (
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={selected[category.id]}
                      onChange={(event) =>
                        setPrice(category.id, event.target.value)
                      }
                      placeholder={t('providerDash.startingPrice')}
                      aria-label={`${category.name} price`}
                      className="h-8 text-sm"
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        <Button
          type="button"
          variant="brand"
          onClick={handleSave}
          disabled={mutation.isPending || isLoading}
        >
          {mutation.isPending ? t('common.saving') : t('providerDash.saveCategories')}
        </Button>
      </CardContent>
    </Card>
  )
}

function AreasTab({ provider, areas, isLoading }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSelected((provider.areas || []).map((area) => area.id))
  }, [provider])

  const mutation = useMutation({
    mutationFn: async (areaIds) => {
      const { data } = await api.put('/providers/me/areas', { areaIds })
      return data.provider
    },
    onSuccess: () => {
      invalidateProvider(queryClient)
      toast.success(t('providerDash.areasSaved'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return areas
    }
    return areas.filter(
      (area) =>
        area.name.toLowerCase().includes(term) ||
        area.state.toLowerCase().includes(term)
    )
  }, [areas, search])

  function toggle(areaId) {
    setSelected((current) => {
      if (current.includes(areaId)) {
        return current.filter((id) => id !== areaId)
      }
      if (current.length >= MAX_AREAS) {
        toast.error(t('providerDash.maxAreas'))
        return current
      }
      return [...current, areaId]
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{t('providerDash.areasTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('providerDash.areasSubtitle')}
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {formatNumber(selected.length, i18n.resolvedLanguage)} / {MAX_AREAS}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-lg" />
            ))}
          </div>
        ) : areas.length === 0 ? (
          <EmptyState icon={MapPinned} title={t('providerDash.areasEmpty')} />
        ) : (
          <>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('providerDash.searchAreas')}
              className="h-10"
            />

            <div className="max-h-80 space-y-1 overflow-y-auto pe-1">
              {filtered.map((area) => {
                const active = selected.includes(area.id)
                return (
                  <label
                    key={area.id}
                    htmlFor={`area-${area.id}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      active
                        ? 'border-brand/60 bg-brand-soft/40'
                        : 'border-transparent hover:bg-muted'
                    )}
                  >
                    <Checkbox
                      id={`area-${area.id}`}
                      checked={active}
                      onCheckedChange={() => toggle(area.id)}
                    />
                    <span className="flex-1 text-sm font-medium">{area.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {area.state}
                    </span>
                  </label>
                )
              })}
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t('admin.noAreas')}
                </p>
              ) : null}
            </div>
          </>
        )}

        <Button
          type="button"
          variant="brand"
          onClick={() => mutation.mutate(selected)}
          disabled={mutation.isPending || isLoading}
        >
          {mutation.isPending ? t('common.saving') : t('providerDash.saveAreas')}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ProviderDashboard() {
  const { t } = useTranslation()
  const providerQuery = useMyProvider()
  const categoriesQuery = useCategories()
  const areasQuery = useAreas()
  const provider = providerQuery.data

  if (providerQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (providerQuery.isError) {
    return <ErrorState onRetry={() => providerQuery.refetch()} />
  }

  if (!provider) {
    return null
  }

  const hintKeys = {
    UNVERIFIED: 'hintUnverified',
    PENDING: 'hintPending',
    VERIFIED: 'hintVerified',
    REJECTED: 'hintRejected',
  }

  const fullName = [provider.user?.firstName, provider.user?.lastName]
    .filter(Boolean)
    .join(' ')
  const isVerified = provider.verificationStatus === 'VERIFIED'

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('providerDash.welcome', { name: fullName })}
        subtitle={t('providerDash.profileSubtitle')}
        action={
          <Button
            asChild={isVerified}
            variant="outline"
            disabled={!isVerified}
            className={cn(!isVerified && 'opacity-60')}
          >
            {isVerified ? (
              <Link to={`/providers/${provider.id}`}>
                <ExternalLink className="size-4" />
                {t('providerDash.preview')}
              </Link>
            ) : (
              <span>
                <ExternalLink className="size-4" />
                {t('providerDash.preview')}
              </span>
            )}
          </Button>
        }
      />

      <Card
        className={cn(
          'border-s-4',
          provider.verificationStatus === 'VERIFIED'
            ? 'border-s-brand'
            : provider.verificationStatus === 'REJECTED'
              ? 'border-s-destructive'
              : 'border-s-amber-400'
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
            {isVerified ? (
              <BadgeCheck className="size-5 text-brand-dark dark:text-brand" />
            ) : (
              <ShieldCheck className="size-5 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{t('providerDash.verification')}</p>
              <StatusBadge status={provider.verificationStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t(`providerDash.${hintKeys[provider.verificationStatus] || 'hintUnverified'}`)}
            </p>
            {provider.verificationNote ? (
              <p className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {t('providerDash.verificationNote')}:{' '}
                </span>
                {provider.verificationNote}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="gap-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">{t('providerDash.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="categories">
            {t('providerDash.tabs.categories')}
          </TabsTrigger>
          <TabsTrigger value="areas">{t('providerDash.tabs.areas')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab provider={provider} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab
            provider={provider}
            categories={categoriesQuery.data || []}
            isLoading={categoriesQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="areas">
          <AreasTab
            provider={provider}
            areas={areasQuery.data || []}
            isLoading={areasQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
