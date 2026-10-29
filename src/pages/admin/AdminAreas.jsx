import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPinned, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState, PageHeader } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAreas } from '@/hooks/queries'
import { api, getErrorMessage } from '@/lib/api'

const ALL = 'all'

export default function AdminAreas() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const areasQuery = useAreas()
  const [stateFilter, setStateFilter] = useState(ALL)
  const [form, setForm] = useState({ name: '', state: '' })
  const [deleting, setDeleting] = useState(null)

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/areas', payload)
      return data.area
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
      setForm({ name: '', state: '' })
      toast.success(t('admin.areaCreated'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/areas/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
      setDeleting(null)
      toast.success(t('admin.areaDeleted'))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t('errors.generic')))
    },
  })

  const areas = useMemo(() => areasQuery.data || [], [areasQuery.data])

  const states = useMemo(
    () => Array.from(new Set(areas.map((area) => area.state))).sort(),
    [areas]
  )

  const filtered = useMemo(
    () =>
      stateFilter === ALL
        ? areas
        : areas.filter((area) => area.state === stateFilter),
    [areas, stateFilter]
  )

  function handleSubmit(event) {
    event.preventDefault()
    const name = form.name.trim()
    const state = form.state.trim()

    if (!name || !state) {
      return
    }

    createMutation.mutate({ name, state })
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('admin.areasTitle')} subtitle={t('admin.areasSubtitle')} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.addArea')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={t('admin.areaNamePlaceholder')}
              aria-label={t('admin.areaName')}
              maxLength={100}
            />
            <Input
              value={form.state}
              onChange={(event) =>
                setForm((current) => ({ ...current, state: event.target.value }))
              }
              placeholder={t('admin.statePlaceholder')}
              aria-label={t('admin.stateName')}
              maxLength={100}
              className="sm:max-w-56"
            />
            <Button
              type="submit"
              variant="brand"
              disabled={
                createMutation.isPending || !form.name.trim() || !form.state.trim()
              }
            >
              <Plus className="size-4" />
              {createMutation.isPending ? t('common.adding') : t('admin.addArea')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-sm text-muted-foreground">
          {t('admin.filterState')}
        </Label>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="h-9 w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('admin.allStates')}</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {areasQuery.isError ? (
        <ErrorState onRetry={() => areasQuery.refetch()} />
      ) : areasQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title={t('admin.noAreas')}
          description={t('admin.noAreasHint')}
        />
      ) : (
        <Card className="gap-0 py-0">
          <CardContent className="divide-y p-0">
            {filtered.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-dark dark:text-brand">
                    <MapPinned className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{area.name}</p>
                    <Badge
                      variant="secondary"
                      className="mt-0.5 rounded-full text-[10px]"
                    >
                      {area.state}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleting(area)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteAreaTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteAreaText')}
              {deleting ? (
                <span className="mt-2 block font-semibold text-foreground">
                  {deleting.name}, {deleting.state}
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleting.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
